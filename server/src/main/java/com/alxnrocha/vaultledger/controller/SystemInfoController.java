package com.alxnrocha.vaultledger.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
@Tag(name = "System", description = "System health, engine status, and runtime information")
public class SystemInfoController {

    @GetMapping("/health")
    @Operation(summary = "System health & engine state", description = "Returns active platform metadata, version, and timestamp.")
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "VaultLedger Core Platform",
                "version", "1.0.0-SNAPSHOT",
                "engine", "Double-Entry Ledger Engine",
                "security", "Spring Security 6 (RSA-256 + RBAC)",
                "timestamp", Instant.now().toString()
        ));
    }
}
