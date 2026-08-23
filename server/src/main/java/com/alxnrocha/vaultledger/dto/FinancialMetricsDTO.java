package com.alxnrocha.vaultledger.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;

@Schema(description = "Calculated financial solvency, liquidity, and balance sheet KPIs")
public record FinancialMetricsDTO(
        @Schema(description = "Total assets across all liquid and custody accounts", example = "21550000.0000")
        BigDecimal totalAssets,

        @Schema(description = "Total deposit liabilities and clearing obligations", example = "9400000.0000")
        BigDecimal totalLiabilities,

        @Schema(description = "Total paid-in capital and retained earnings", example = "11850000.0000")
        BigDecimal totalEquity,

        @Schema(description = "Total revenue and fee income", example = "800000.0000")
        BigDecimal totalRevenue,

        @Schema(description = "Total operational and liquidity network expenses", example = "450000.0000")
        BigDecimal totalExpenses,

        @Schema(description = "Net income (Revenue - Expenses)", example = "350000.0000")
        BigDecimal netIncome,

        @Schema(description = "Solvency ratio (Assets / Liabilities)", example = "2.2926")
        BigDecimal solvencyRatio,

        @Schema(description = "Equity to Asset capitalization ratio (Equity / Assets)", example = "0.5499")
        BigDecimal equityToAssetRatio,

        @Schema(description = "Debt to Equity financial leverage ratio (Liabilities / Equity)", example = "0.7932")
        BigDecimal debtToEquityRatio,

        @Schema(description = "Verification boolean confirming fundamental accounting balance: Assets == Liabilities + Equity")
        boolean balanceSheetBalanced,

        @Schema(description = "Timestamp when metrics were computed")
        Instant calculatedAt
) {}
