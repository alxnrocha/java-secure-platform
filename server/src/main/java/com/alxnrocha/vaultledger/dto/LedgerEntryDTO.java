package com.alxnrocha.vaultledger.dto;

import com.alxnrocha.vaultledger.enums.EntryType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Persisted journal entry line item")
public record LedgerEntryDTO(
        @Schema(description = "Unique entry ID")
        UUID id,

        @Schema(description = "Parent transaction ID")
        UUID transactionId,

        @Schema(description = "Target account ID")
        UUID accountId,

        @Schema(description = "Account code", example = "1000")
        String accountCode,

        @Schema(description = "Account legal name", example = "Operational Cash Reserve")
        String accountName,

        @Schema(description = "Entry direction", example = "DEBIT")
        EntryType entryType,

        @Schema(description = "Line amount", example = "25000.0000")
        BigDecimal amount,

        @Schema(description = "Snapshot of account balance immediately after entry execution", example = "2525000.0000")
        BigDecimal runningBalance,

        @Schema(description = "Entry memo/note")
        String description,

        @Schema(description = "Timestamp when entry was recorded")
        Instant createdAt
) {}
