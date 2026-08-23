package com.alxnrocha.vaultledger.dto;

import com.alxnrocha.vaultledger.enums.AccountType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(description = "Payload to create a new financial account")
public record CreateAccountDTO(
        @NotBlank(message = "Account code is required")
        @Size(min = 3, max = 20, message = "Code must be between 3 and 20 characters")
        @Pattern(regexp = "^[0-9]{3,10}$", message = "Account code must be numerical (e.g. 1000, 1010, 2000)")
        @Schema(description = "Hierarchical accounting code", example = "1040")
        String code,

        @NotBlank(message = "Account name is required")
        @Size(min = 3, max = 100, message = "Name must be between 3 and 100 characters")
        @Schema(description = "Descriptive account name", example = "Secondary Settlement Reserve")
        String name,

        @NotNull(message = "Account type is required")
        @Schema(description = "Account nature", example = "ASSET")
        AccountType type,

        @Schema(description = "ISO-4217 Currency", example = "EUR", defaultValue = "EUR")
        String currency,

        @Schema(description = "Optional parent account ID for grouping")
        UUID parentAccountId
) {}
