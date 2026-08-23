package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.entity.RefreshTokenEntity;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.enums.RoleType;
import com.alxnrocha.vaultledger.exception.SecurityAnomalyException;
import com.alxnrocha.vaultledger.repository.RefreshTokenRepository;
import com.alxnrocha.vaultledger.security.JwtTokenService;
import com.alxnrocha.vaultledger.security.RsaKeyProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests — Redis Refresh Token Rotation & Anomaly Detection")
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private JwtTokenService jwtTokenService;
    private RefreshTokenService refreshTokenService;
    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        RsaKeyProvider rsaKeyProvider = new RsaKeyProvider();
        jwtTokenService = new JwtTokenService(rsaKeyProvider, 900000L, 604800000L);
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, jwtTokenService, Optional.empty());

        testUser = new UserEntity(
                UUID.fromString("a0000000-0000-0000-0000-000000000001"),
                "operator",
                "operator@vaultledger.internal",
                "$2a$10$hash",
                "Carlos",
                "Mendoza",
                RoleType.ROLE_OPERATOR
        );
    }

    @Test
    @DisplayName("Should issue new refresh token pair and persist token entity")
    void testIssueRefreshToken() {
        when(refreshTokenRepository.save(any(RefreshTokenEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var tokenPair = refreshTokenService.issueRefreshToken(testUser, null);

        assertNotNull(tokenPair);
        assertNotNull(tokenPair.accessToken());
        assertNotNull(tokenPair.refreshToken());
        assertNotNull(tokenPair.familyId());
        verify(refreshTokenRepository, times(1)).save(any(RefreshTokenEntity.class));
    }

    @Test
    @DisplayName("Should rotate active token and maintain family ID")
    void testRotateRefreshTokenSuccess() {
        UUID familyId = UUID.randomUUID();
        String rawToken = "raw-opaque-token-12345";
        String tokenHash = refreshTokenService.hashToken(rawToken);

        RefreshTokenEntity activeEntity = new RefreshTokenEntity(
                testUser, tokenHash, familyId, Instant.now().plusSeconds(3600)
        );

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(activeEntity));
        when(refreshTokenRepository.save(any(RefreshTokenEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var rotatedPair = refreshTokenService.rotateRefreshToken(rawToken);

        assertNotNull(rotatedPair);
        assertEquals(familyId, rotatedPair.familyId());
        assertTrue(activeEntity.isRevoked(), "Old token must be marked as revoked");
        verify(refreshTokenRepository, atLeast(2)).save(any(RefreshTokenEntity.class));
    }

    @Test
    @DisplayName("Should detect token reuse anomaly and revoke entire family")
    void testTokenReuseAnomalyDetection() {
        UUID familyId = UUID.randomUUID();
        String rawToken = "reused-compromised-token";
        String tokenHash = refreshTokenService.hashToken(rawToken);

        RefreshTokenEntity alreadyRevokedEntity = new RefreshTokenEntity(
                testUser, tokenHash, familyId, Instant.now().plusSeconds(3600)
        );
        alreadyRevokedEntity.setRevoked(true); // Already used/revoked

        when(refreshTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(alreadyRevokedEntity));

        assertThrows(SecurityAnomalyException.class, () -> refreshTokenService.rotateRefreshToken(rawToken));

        // Verify entire family revocation was triggered
        verify(refreshTokenRepository, times(1)).revokeFamily(familyId);
    }
}
