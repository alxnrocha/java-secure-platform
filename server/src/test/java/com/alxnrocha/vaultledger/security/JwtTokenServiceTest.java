package com.alxnrocha.vaultledger.security;

import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.enums.RoleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests — RSA-256 JWT Token Service & Cryptography")
class JwtTokenServiceTest {

    private JwtTokenService jwtTokenService;
    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        RsaKeyProvider rsaKeyProvider = new RsaKeyProvider();
        jwtTokenService = new JwtTokenService(rsaKeyProvider, 900000L, 604800000L);

        testUser = new UserEntity(
                UUID.fromString("a0000000-0000-0000-0000-000000000001"),
                "admin",
                "admin@vaultledger.internal",
                "$2a$10$hash",
                "Alexandre",
                "Rocha",
                RoleType.ROLE_ADMIN
        );
        testUser.setMfaEnabled(true);
    }

    @Test
    @DisplayName("Should generate valid RSA-256 signed access token")
    void testGenerateAndValidateToken() {
        String token = jwtTokenService.generateAccessToken(testUser);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(jwtTokenService.validateToken(token));
    }

    @Test
    @DisplayName("Should extract correct subject and claims from JWT")
    void testExtractClaims() {
        String token = jwtTokenService.generateAccessToken(testUser);

        assertEquals("admin", jwtTokenService.extractUsername(token));
        assertEquals(testUser.getId(), jwtTokenService.extractUserId(token));
        assertEquals("ROLE_ADMIN", jwtTokenService.extractRole(token));
        assertNotNull(jwtTokenService.extractExpiration(token));
    }

    @Test
    @DisplayName("Should reject tampered token with invalid signature")
    void testRejectTamperedToken() {
        String token = jwtTokenService.generateAccessToken(testUser);
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        assertFalse(jwtTokenService.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("Should generate high-entropy opaque refresh tokens")
    void testGenerateOpaqueRefreshToken() {
        String refreshToken1 = jwtTokenService.generateOpaqueRefreshToken();
        String refreshToken2 = jwtTokenService.generateOpaqueRefreshToken();

        assertNotNull(refreshToken1);
        assertNotNull(refreshToken2);
        assertNotEquals(refreshToken1, refreshToken2);
        assertTrue(refreshToken1.length() >= 32);
    }
}
