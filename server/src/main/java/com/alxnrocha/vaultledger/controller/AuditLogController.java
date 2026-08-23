package com.alxnrocha.vaultledger.controller;

import com.alxnrocha.vaultledger.dto.AuditChainVerificationDTO;
import com.alxnrocha.vaultledger.dto.AuditLogDTO;
import com.alxnrocha.vaultledger.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Forensic Audit Log", description = "Immutable audit log query and chained SHA-256 integrity verification")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR', 'COMPLIANCE_OFFICER')")
    @Operation(summary = "Get recent audit trail records", description = "Returns top 50 recent audit blocks.")
    public ResponseEntity<List<AuditLogDTO>> getRecentLogs() {
        return ResponseEntity.ok(auditLogService.getRecentAuditLogs());
    }

    @GetMapping("/paged")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR', 'COMPLIANCE_OFFICER')")
    @Operation(summary = "Get paginated audit logs")
    public ResponseEntity<Page<AuditLogDTO>> getPagedLogs(Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAllAuditLogs(pageable));
    }

    @GetMapping("/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR', 'COMPLIANCE_OFFICER')")
    @Operation(summary = "Cryptographically verify entire SHA-256 audit chain integrity", description = "Sweeps and verifies hash continuity from Genesis block to latest entry.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Audit chain verification executed (result contains valid true/false)")
    })
    public ResponseEntity<AuditChainVerificationDTO> verifyIntegrity() {
        return ResponseEntity.ok(auditLogService.verifyAuditChainIntegrity());
    }

    @GetMapping("/entity/{name}/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AUDITOR', 'COMPLIANCE_OFFICER')")
    @Operation(summary = "Get audit trail for specific entity ID")
    public ResponseEntity<List<AuditLogDTO>> getLogsForEntity(
            @PathVariable String name,
            @PathVariable String id
    ) {
        return ResponseEntity.ok(auditLogService.getLogsForEntity(name, id));
    }
}
