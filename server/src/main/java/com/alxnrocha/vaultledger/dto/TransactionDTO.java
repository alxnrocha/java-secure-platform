package com.alxnrocha.vaultledger.dto;

import com.alxnrocha.vaultledger.enums.TransactionStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Financial transaction representation with double-entry journal items")
public record TransactionDTO(
        @Schema(description = "Unique transaction ID")
        UUID id,

        @Schema(description = "Immutable human-readable reference number", example = "TX-20260824-A1B2C3D4")
        String referenceNumber,

        @Schema(description = "Transaction purpose description", example = "Customer capital injection")
        String description,

        @Schema(description = "Execution status", example = "POSTED")
        TransactionStatus status,

        @Schema(description = "Total transaction volume (sum of debits)", example = "50000.0000")
        BigDecimal totalAmount,

        @Schema(description = "ISO-4217 Currency", example = "EUR")
        String currency,

        @Schema(description = "ID of transaction this transaction reverses, if applicable")
        UUID reversalOfId,

        @Schema(description = "User who initiated or posted the transaction")
        UserProfileDTO createdByUser,

        @Schema(description = "Official journal posting timestamp")
        Instant postedAt,

        @Schema(description = "Double-entry journal line items")
        List<LedgerEntryDTO> entries
) {}
