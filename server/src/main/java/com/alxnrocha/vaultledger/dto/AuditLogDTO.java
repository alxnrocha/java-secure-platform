package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Forensic tamper-evident audit log record")
public record AuditLogDTO(
        @Schema(description = "Unique audit record ID")
        UUID id,

        @Schema(description = "Operational action performed", example = "POST_TRANSACTION")
        String action,

        @Schema(description = "Target entity type", example = "TransactionEntity")
        String entityName,

        @Schema(description = "Target entity identifier", example = "TX-20260824-A1B2C3D4")
        String entityId,

        @Schema(description = "User ID who triggered the action")
        UUID userId,

        @Schema(description = "User email who triggered the action", example = "operator@vaultledger.internal")
        String userEmail,

        @Schema(description = "Network IP address of the request", example = "192.168.1.100")
        String ipAddress,

        @Schema(description = "JSON state before mutation, if applicable")
        String payloadBefore,

        @Schema(description = "JSON state after mutation")
        String payloadAfter,

        @Schema(description = "SHA-256 hash of the predecessor audit record", example = "8f434346648f6b96df89dda901c5176b10e6d0ceec3e16182e12e000a2852b7b")
        String previousHash,

        @Schema(description = "Chained cryptographic SHA-256 hash of this record", example = "3c985fa50f836db8e285a7bb4324f6103e390c528f8045610ecdb44a30efca48")
        String currentHash,

        @Schema(description = "Audit timestamp")
        Instant createdAt
) {}
