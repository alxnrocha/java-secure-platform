package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Refresh token exchange request")
public record RefreshTokenRequestDTO(
        @NotBlank(message = "Refresh token is required")
        @Schema(description = "Opaque refresh token previously issued", example = "a9b8c7d6e5f4...")
        String refreshToken
) {}
