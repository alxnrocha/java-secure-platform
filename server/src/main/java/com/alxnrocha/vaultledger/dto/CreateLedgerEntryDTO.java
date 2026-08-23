package com.alxnrocha.vaultledger.dto;

import com.alxnrocha.vaultledger.enums.EntryType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Schema(description = "Individual debit or credit journal line item")
public record CreateLedgerEntryDTO(
        @NotBlank(message = "Account code is required")
        @Schema(description = "Target account code", example = "1000")
        String accountCode,

        @NotNull(message = "Entry type (DEBIT or CREDIT) is required")
        @Schema(description = "Direction of financial movement", example = "DEBIT")
        EntryType entryType,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0001", message = "Amount must be strictly greater than 0")
        @Schema(description = "Entry amount with up to 4 decimal precision", example = "25000.0000")
        BigDecimal amount,

        @Schema(description = "Line item note/memo", example = "Interbank settlement funding")
        String description
) {}
