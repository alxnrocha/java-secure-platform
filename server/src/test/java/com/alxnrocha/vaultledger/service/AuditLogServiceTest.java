package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.AuditChainVerificationDTO;
import com.alxnrocha.vaultledger.entity.AuditLogEntity;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.enums.RoleType;
import com.alxnrocha.vaultledger.repository.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests — Immutable Forensic Audit Log & Chained SHA-256 Verification")
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    private AuditLogService auditLogService;
    private UserEntity auditorUser;

    @BeforeEach
    void setUp() {
        auditLogService = new AuditLogService(auditLogRepository);

        auditorUser = new UserEntity(
                UUID.randomUUID(),
                "auditor",
                "auditor@vaultledger.internal",
                "hash",
                "Elena",
                "Vargas",
                RoleType.ROLE_AUDITOR
        );
    }

    @Test
    @DisplayName("Should record audit log chained to previous block hash")
    void testRecordAuditLogSuccess() {
        String genesis = AuditLogService.GENESIS_HASH;
        when(auditLogRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(auditLogRepository.save(any(AuditLogEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var logDto = auditLogService.recordAuditLog(
                "POST_TRANSFER",
                "TransactionEntity",
                "TX-20260824-001",
                auditorUser,
                "127.0.0.1",
                null,
                "{\"amount\": 5000}"
        );

        assertNotNull(logDto);
        assertEquals(genesis, logDto.previousHash());
        assertNotNull(logDto.currentHash());
        assertEquals(64, logDto.currentHash().length());
        verify(auditLogRepository, times(1)).save(any(AuditLogEntity.class));
    }

    @Test
    @DisplayName("Should verify audit chain integrity as valid for unbroken log chain")
    void testVerifyAuditChainValid() {
        String h0 = AuditLogService.GENESIS_HASH;
        String h1 = auditLogService.calculateHash(h0, "INIT", "System", "1", "auditor@vaultledger.internal", "{}");
        String h2 = auditLogService.calculateHash(h1, "TX", "Transaction", "2", "auditor@vaultledger.internal", "{}");

        AuditLogEntity b1 = new AuditLogEntity("INIT", "System", "1", auditorUser, "auditor@vaultledger.internal", "127.0.0.1", null, "{}", h0, h1);
        b1.setId(UUID.randomUUID());
        AuditLogEntity b2 = new AuditLogEntity("TX", "Transaction", "2", auditorUser, "auditor@vaultledger.internal", "127.0.0.1", null, "{}", h1, h2);
        b2.setId(UUID.randomUUID());

        when(auditLogRepository.findAll(any(Sort.class))).thenReturn(List.of(b1, b2));

        AuditChainVerificationDTO result = auditLogService.verifyAuditChainIntegrity();

        assertTrue(result.valid());
        assertEquals(2, result.totalLogsChecked());
        assertNull(result.brokenLogId());
    }

    @Test
    @DisplayName("Should detect tamper anomaly when record payload or hash has been altered")
    void testDetectTamperedAuditLog() {
        String h0 = AuditLogService.GENESIS_HASH;
        String h1 = auditLogService.calculateHash(h0, "INIT", "System", "1", "auditor@vaultledger.internal", "{}");
        String forgedHash = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

        AuditLogEntity b1 = new AuditLogEntity("INIT", "System", "1", auditorUser, "auditor@vaultledger.internal", "127.0.0.1", null, "{}", h0, h1);
        b1.setId(UUID.randomUUID());
        // b2 has been tampered with forged hash
        AuditLogEntity b2 = new AuditLogEntity("TX", "Transaction", "2", auditorUser, "auditor@vaultledger.internal", "127.0.0.1", null, "{\"malicious\": true}", h1, forgedHash);
        UUID tamperedId = UUID.randomUUID();
        b2.setId(tamperedId);

        when(auditLogRepository.findAll(any(Sort.class))).thenReturn(List.of(b1, b2));

        AuditChainVerificationDTO result = auditLogService.verifyAuditChainIntegrity();

        assertFalse(result.valid(), "Tampered chain must be detected as invalid");
        assertEquals(tamperedId, result.brokenLogId());
        assertTrue(result.message().contains("tampering detected"));
    }
}
