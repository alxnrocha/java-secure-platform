package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "User authentication login credentials")
public record LoginRequestDTO(
        @NotBlank(message = "Username or email is required")
        @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
        @Schema(description = "Account username or email", example = "admin")
        String username,

        @NotBlank(message = "Password cannot be empty")
        @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
        @Schema(description = "Plaintext password", example = "Password@123")
        String password
) {}
