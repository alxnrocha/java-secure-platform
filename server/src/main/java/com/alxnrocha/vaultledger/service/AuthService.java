package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.AuthResponseDTO;
import com.alxnrocha.vaultledger.dto.LoginRequestDTO;
import com.alxnrocha.vaultledger.dto.LogoutRequestDTO;
import com.alxnrocha.vaultledger.dto.RefreshTokenRequestDTO;
import com.alxnrocha.vaultledger.dto.UserProfileDTO;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.repository.RefreshTokenRepository;
import com.alxnrocha.vaultledger.repository.UserRepository;
import com.alxnrocha.vaultledger.security.CustomUserDetails;
import com.alxnrocha.vaultledger.security.JwtTokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenService jwtTokenService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            RefreshTokenService refreshTokenService,
            JwtTokenService jwtTokenService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenService = refreshTokenService;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserEntity user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userDetails.getUsername()));

        var tokenPair = refreshTokenService.issueRefreshToken(user, null);
        UserProfileDTO profile = mapToProfile(user);

        return AuthResponseDTO.of(
                tokenPair.accessToken(),
                tokenPair.refreshToken(),
                jwtTokenService.getAccessTokenExpirationMs(),
                profile
        );
    }

    @Transactional
    public AuthResponseDTO refresh(RefreshTokenRequestDTO request) {
        var tokenPair = refreshTokenService.rotateRefreshToken(request.refreshToken());
        String tokenHash = refreshTokenService.hashToken(tokenPair.refreshToken());

        var tokenEntity = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        UserProfileDTO profile = mapToProfile(tokenEntity.getUser());

        return AuthResponseDTO.of(
                tokenPair.accessToken(),
                tokenPair.refreshToken(),
                jwtTokenService.getAccessTokenExpirationMs(),
                profile
        );
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getCurrentUserProfile(CustomUserDetails userDetails) {
        UserEntity user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return mapToProfile(user);
    }

    public void logout(String authHeader, LogoutRequestDTO logoutRequest) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7).trim();
            if (jwtTokenService.validateToken(accessToken)) {
                Date expiration = jwtTokenService.extractExpiration(accessToken);
                long remainingTtl = (expiration.getTime() - System.currentTimeMillis()) / 1000;
                refreshTokenService.blacklistAccessToken(accessToken, remainingTtl);
            }
        }

        if (logoutRequest != null && logoutRequest.refreshToken() != null && !logoutRequest.refreshToken().isBlank()) {
            String tokenHash = refreshTokenService.hashToken(logoutRequest.refreshToken());
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(entity -> {
                refreshTokenService.revokeTokenFamily(entity.getFamilyId());
            });
        }
    }

    private UserProfileDTO mapToProfile(UserEntity user) {
        return new UserProfileDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.isActive(),
                user.isMfaEnabled(),
                user.getCreatedAt()
        );
    }
}
