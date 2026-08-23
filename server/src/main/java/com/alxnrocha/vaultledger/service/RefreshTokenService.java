package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.entity.RefreshTokenEntity;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.exception.SecurityAnomalyException;
import com.alxnrocha.vaultledger.repository.RefreshTokenRepository;
import com.alxnrocha.vaultledger.security.JwtTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenService.class);
    private static final String REDIS_REFRESH_PREFIX = "vault:refresh:";
    private static final String REDIS_FAMILY_PREFIX = "vault:family:";
    private static final String REDIS_BLACKLIST_PREFIX = "vault:blacklist:";

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenService jwtTokenService;
    private final Optional<RedisTemplate<String, String>> redisTemplate;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            JwtTokenService jwtTokenService,
            Optional<RedisTemplate<String, String>> redisTemplate
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtTokenService = jwtTokenService;
        this.redisTemplate = redisTemplate;
    }

    @Transactional
    public TokenPair issueRefreshToken(UserEntity user, UUID existingFamilyId) {
        UUID familyId = (existingFamilyId != null) ? existingFamilyId : UUID.randomUUID();
        String rawToken = jwtTokenService.generateOpaqueRefreshToken();
        String tokenHash = hashToken(rawToken);
        Instant expiresAt = Instant.now().plusMillis(jwtTokenService.getRefreshTokenExpirationMs());

        RefreshTokenEntity entity = new RefreshTokenEntity(user, tokenHash, familyId, expiresAt);
        refreshTokenRepository.save(entity);

        // Store in Redis with TTL
        redisTemplate.ifPresent(template -> {
            try {
                long ttlSeconds = Duration.between(Instant.now(), expiresAt).getSeconds();
                if (ttlSeconds > 0) {
                    template.opsForValue().set(
                            REDIS_REFRESH_PREFIX + tokenHash,
                            user.getId() + ":" + familyId + ":ACTIVE",
                            Duration.ofSeconds(ttlSeconds)
                    );
                    template.opsForSet().add(REDIS_FAMILY_PREFIX + familyId, tokenHash);
                    template.expire(REDIS_FAMILY_PREFIX + familyId, Duration.ofSeconds(ttlSeconds));
                }
            } catch (Exception e) {
                log.warn("Redis unavailable for caching refresh token, relying on database: {}", e.getMessage());
            }
        });

        String accessToken = jwtTokenService.generateAccessToken(user);
        return new TokenPair(accessToken, rawToken, familyId, expiresAt);
    }

    @Transactional
    public TokenPair rotateRefreshToken(String rawToken) {
        String tokenHash = hashToken(rawToken);
        RefreshTokenEntity entity = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (entity.isRevoked() || entity.getExpiresAt().isBefore(Instant.now())) {
            // SECURITY ANOMALY: Token reuse attempt detected! Revoke entire token family
            log.error("SECURITY ALERT: Refresh token reuse detected for family ID: {}. Revoking entire family!", entity.getFamilyId());
            revokeTokenFamily(entity.getFamilyId());
            throw new SecurityAnomalyException("Security alert: Refresh token reuse detected. All sessions in family have been revoked.");
        }

        // Mark current token as revoked
        entity.setRevoked(true);
        refreshTokenRepository.save(entity);

        // Issue new token in same family
        return issueRefreshToken(entity.getUser(), entity.getFamilyId());
    }

    @Transactional
    public void revokeTokenFamily(UUID familyId) {
        refreshTokenRepository.revokeFamily(familyId);

        redisTemplate.ifPresent(template -> {
            try {
                String familyKey = REDIS_FAMILY_PREFIX + familyId;
                var members = template.opsForSet().members(familyKey);
                if (members != null) {
                    for (String hash : members) {
                        template.delete(REDIS_REFRESH_PREFIX + hash);
                    }
                }
                template.delete(familyKey);
            } catch (Exception e) {
                log.warn("Redis error while revoking family: {}", e.getMessage());
            }
        });
    }

    public void blacklistAccessToken(String accessToken, long remainingTtlSeconds) {
        if (remainingTtlSeconds <= 0) return;
        redisTemplate.ifPresent(template -> {
            try {
                String tokenHash = hashToken(accessToken);
                template.opsForValue().set(
                        REDIS_BLACKLIST_PREFIX + tokenHash,
                        "REVOKED",
                        Duration.ofSeconds(remainingTtlSeconds)
                );
            } catch (Exception e) {
                log.warn("Redis error while blacklisting access token: {}", e.getMessage());
            }
        });
    }

    public boolean isAccessTokenBlacklisted(String accessToken) {
        return redisTemplate.map(template -> {
            try {
                String tokenHash = hashToken(accessToken);
                return Boolean.TRUE.equals(template.hasKey(REDIS_BLACKLIST_PREFIX + tokenHash));
            } catch (Exception e) {
                log.warn("Redis error while checking blacklist: {}", e.getMessage());
                return false;
            }
        }).orElse(false);
    }

    public String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not supported", e);
        }
    }

    public record TokenPair(String accessToken, String refreshToken, UUID familyId, Instant expiresAt) {}
}
