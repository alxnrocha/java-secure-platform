package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.Map;

@Schema(description = "Aggregated financial breakdown by account nature")
public record AccountSummaryDTO(
        @Schema(description = "Total assets balance")
        BigDecimal totalAssets,

        @Schema(description = "Total liabilities balance")
        BigDecimal totalLiabilities,

        @Schema(description = "Total equity balance")
        BigDecimal totalEquity,

        @Schema(description = "Total revenue balance")
        BigDecimal totalRevenue,

        @Schema(description = "Total expense balance")
        BigDecimal totalExpenses,

        @Schema(description = "Breakdown per account type")
        Map<String, BigDecimal> breakdownByType,

        @Schema(description = "Total active accounts count")
        long totalAccountsCount
) {}
