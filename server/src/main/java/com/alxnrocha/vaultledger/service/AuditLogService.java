package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.AuditChainVerificationDTO;
import com.alxnrocha.vaultledger.dto.AuditLogDTO;
import com.alxnrocha.vaultledger.entity.AuditLogEntity;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    public static final String GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Appends an immutable forensic audit log record chained to the predecessor block via SHA-256.
     */
    @Transactional
    public AuditLogDTO recordAuditLog(
            String action,
            String entityName,
            String entityId,
            UserEntity user,
            String ipAddress,
            String payloadBefore,
            String payloadAfter
    ) {
        String previousHash = auditLogRepository.findTopByOrderByCreatedAtDesc()
                .map(AuditLogEntity::getCurrentHash)
                .orElse(GENESIS_HASH);

        String userEmail = (user != null) ? user.getEmail() : "system@vaultledger.internal";
        String currentHash = calculateHash(previousHash, action, entityName, entityId, userEmail, payloadAfter);

        AuditLogEntity entity = new AuditLogEntity(
                action,
                entityName,
                entityId,
                user,
                userEmail,
                ipAddress,
                payloadBefore,
                payloadAfter,
                previousHash,
                currentHash
        );

        AuditLogEntity saved = auditLogRepository.save(entity);
        log.info("Appended forensic audit log block: {} | Action: {} | Entity: {}:{} | Hash: {}",
                saved.getId(), action, entityName, entityId, currentHash);

        return mapToDTO(saved);
    }

    /**
     * Sweeps all audit logs from Genesis block to latest in chronological order.
     * Verifies unbroken hash continuity and cryptographic integrity of every record.
     */
    @Transactional(readOnly = true)
    public AuditChainVerificationDTO verifyAuditChainIntegrity() {
        List<AuditLogEntity> chain = auditLogRepository.findAll(Sort.by("createdAt").ascending());

        if (chain.isEmpty()) {
            return new AuditChainVerificationDTO(
                    true, 0, GENESIS_HASH, null, null,
                    "Audit trail is empty. Genesis block is intact.", Instant.now()
            );
        }

        String expectedPreviousHash = GENESIS_HASH;

        for (int i = 0; i < chain.size(); i++) {
            AuditLogEntity block = chain.get(i);

            // 1. Verify link to predecessor
            if (!block.getPreviousHash().equalsIgnoreCase(expectedPreviousHash) && i != 0) {
                log.error("FORENSIC ALERT: Broken hash link at index {} (Block ID: {}). Expected prev: {}, Actual prev: {}",
                        i, block.getId(), expectedPreviousHash, block.getPreviousHash());
                return new AuditChainVerificationDTO(
                        false, chain.size(), expectedPreviousHash, block.getId(), i,
                        String.format("Forensic corruption detected: Block %s has broken previous_hash link.", block.getId()),
                        Instant.now()
                );
            }

            // 2. Re-compute block hash
            String computedHash = calculateHash(
                    block.getPreviousHash(),
                    block.getAction(),
                    block.getEntityName(),
                    block.getEntityId(),
                    block.getUserEmail(),
                    block.getPayloadAfter()
            );

            if (!block.getCurrentHash().equalsIgnoreCase(computedHash)) {
                log.error("FORENSIC ALERT: Tampered payload or invalid hash at index {} (Block ID: {}). Expected: {}, Computed: {}",
                        i, block.getId(), block.getCurrentHash(), computedHash);
                return new AuditChainVerificationDTO(
                        false, chain.size(), block.getPreviousHash(), block.getId(), i,
                        String.format("Forensic tampering detected: Block %s payload/metadata has been illegally modified.", block.getId()),
                        Instant.now()
                );
            }

            expectedPreviousHash = block.getCurrentHash();
        }

        return new AuditChainVerificationDTO(
                true, chain.size(), expectedPreviousHash, null, null,
                String.format("Audit trail integrity verified: all %d chained SHA-256 blocks are cryptographically valid.", chain.size()),
                Instant.now()
        );
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getRecentAuditLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getLogsForEntity(String entityName, String entityId) {
        return auditLogRepository.findByEntityNameAndEntityIdOrderByCreatedAtDesc(entityName, entityId)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public String calculateHash(
            String previousHash,
            String action,
            String entityName,
            String entityId,
            String userEmail,
            String payloadAfter
    ) {
        try {
            String raw = String.format("%s:%s:%s:%s:%s:%s",
                    previousHash, action, entityName, entityId,
                    userEmail, (payloadAfter != null) ? payloadAfter : ""
            );
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    public AuditLogDTO mapToDTO(AuditLogEntity entity) {
        return new AuditLogDTO(
                entity.getId(),
                entity.getAction(),
                entity.getEntityName(),
                entity.getEntityId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getUserEmail(),
                entity.getIpAddress(),
                entity.getPayloadBefore(),
                entity.getPayloadAfter(),
                entity.getPreviousHash(),
                entity.getCurrentHash(),
                entity.getCreatedAt()
        );
    }
}
