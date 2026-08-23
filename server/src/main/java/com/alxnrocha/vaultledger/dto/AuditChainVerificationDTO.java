package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Forensic cryptographic audit trail verification result")
public record AuditChainVerificationDTO(
        @Schema(description = "True if all SHA-256 links in the chain are unbroken and untampered", example = "true")
        boolean valid,

        @Schema(description = "Total number of audit records verified", example = "142")
        long totalLogsChecked,

        @Schema(description = "Latest validated block SHA-256 hash", example = "3c985fa50f836db8e285a7bb4324f6103e390c528f8045610ecdb44a30efca48")
        String lastValidHash,

        @Schema(description = "ID of the tampered record if verification failed, or null if valid")
        UUID brokenLogId,

        @Schema(description = "Zero-based index where chain corruption occurred, or null if valid")
        Integer brokenIndex,

        @Schema(description = "Human-readable forensic verification summary", example = "Audit trail integrity verified: all 142 chained SHA-256 blocks are cryptographically valid.")
        String message,

        @Schema(description = "Timestamp when verification was executed")
        Instant verifiedAt
) {}
