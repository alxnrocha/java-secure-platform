package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User session termination request")
public record LogoutRequestDTO(
        @Schema(description = "Optional refresh token to revoke entire family immediately", example = "a9b8c7d6e5f4...")
        String refreshToken
) {}
