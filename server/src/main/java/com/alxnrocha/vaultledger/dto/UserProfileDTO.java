package com.alxnrocha.vaultledger.dto;

import com.alxnrocha.vaultledger.enums.RoleType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Authenticated user profile payload")
public record UserProfileDTO(
        @Schema(description = "Unique user identifier", example = "a0000000-0000-0000-0000-000000000001")
        UUID id,

        @Schema(description = "User login username", example = "admin")
        String username,

        @Schema(description = "User primary email address", example = "admin@vaultledger.internal")
        String email,

        @Schema(description = "User first name", example = "Alexandre")
        String firstName,

        @Schema(description = "User last name", example = "Rocha")
        String lastName,

        @Schema(description = "Assigned RBAC role", example = "ROLE_ADMIN")
        RoleType role,

        @Schema(description = "Account active state", example = "true")
        boolean active,

        @Schema(description = "Multi-factor authentication status", example = "true")
        boolean mfaEnabled,

        @Schema(description = "Account creation timestamp")
        Instant createdAt
) {}
