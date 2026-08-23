package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Atomic double-entry transaction submission payload")
public record CreateTransactionDTO(
        @NotBlank(message = "Transaction description is required")
        @Size(min = 5, max = 255, message = "Description must be between 5 and 255 characters")
        @Schema(description = "Executive summary of transaction purpose", example = "Corporate treasury liquidity rebalance")
        String description,

        @Schema(description = "ISO-4217 Currency", example = "EUR", defaultValue = "EUR")
        String currency,

        @NotEmpty(message = "Transaction must contain at least two balanced entries")
        @Size(min = 2, message = "Double-entry rules require a minimum of 2 entries (at least 1 debit and 1 credit)")
        @Valid
        @Schema(description = "List of balanced debit and credit entries")
        List<CreateLedgerEntryDTO> entries
) {}
