package com.alxnrocha.vaultledger.controller;

import com.alxnrocha.vaultledger.dto.FinancialMetricsDTO;
import com.alxnrocha.vaultledger.service.FinancialMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/metrics")
@Tag(name = "Financial Metrics", description = "Balance sheet analytics, solvency, liquidity, and capitalization metrics")
@SecurityRequirement(name = "bearerAuth")
public class MetricsController {

    private final FinancialMetricsService financialMetricsService;

    public MetricsController(FinancialMetricsService financialMetricsService) {
        this.financialMetricsService = financialMetricsService;
    }

    @GetMapping("/solvency")
    @Operation(summary = "Get financial solvency, leverage and liquidity ratios", description = "Calculates dynamic balance sheet ratios and equation balance.")
    public ResponseEntity<FinancialMetricsDTO> getSolvencyMetrics() {
        return ResponseEntity.ok(financialMetricsService.calculateSolvencyMetrics());
    }
}
