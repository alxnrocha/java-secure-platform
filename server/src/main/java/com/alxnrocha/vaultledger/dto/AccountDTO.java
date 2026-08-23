package com.alxnrocha.vaultledger.dto;

import com.alxnrocha.vaultledger.enums.AccountType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Financial account detail representation")
public record AccountDTO(
        @Schema(description = "Unique account ID")
        UUID id,

        @Schema(description = "Accounting code", example = "1000")
        String code,

        @Schema(description = "Account legal name", example = "Operational Cash Reserve")
        String name,

        @Schema(description = "Account classification type", example = "ASSET")
        AccountType type,

        @Schema(description = "ISO-4217 Currency", example = "EUR")
        String currency,

        @Schema(description = "Current account balance", example = "2500000.0000")
        BigDecimal balance,

        @Schema(description = "Whether account is currently active", example = "true")
        boolean active,

        @Schema(description = "Parent account ID if part of hierarchy")
        UUID parentAccountId,

        @Schema(description = "Normal accounting balance (DEBIT or CREDIT)", example = "DEBIT")
        String normalBalance,

        @Schema(description = "Account creation timestamp")
        Instant createdAt
) {}
