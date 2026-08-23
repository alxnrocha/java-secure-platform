package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Cryptographic JWT authentication response")
public record AuthResponseDTO(
        @Schema(description = "Stateless RSA-256 signed access token (15-min TTL)")
        String accessToken,

        @Schema(description = "Opaque high-entropy refresh token")
        String refreshToken,

        @Schema(description = "Token authorization scheme", example = "Bearer")
        String tokenType,

        @Schema(description = "Access token lifetime in seconds", example = "900")
        long expiresInSeconds,

        @Schema(description = "Authenticated user profile metadata")
        UserProfileDTO user
) {
    public static AuthResponseDTO of(String accessToken, String refreshToken, long expiresInMs, UserProfileDTO user) {
        return new AuthResponseDTO(accessToken, refreshToken, "Bearer", expiresInMs / 1000, user);
    }
}
