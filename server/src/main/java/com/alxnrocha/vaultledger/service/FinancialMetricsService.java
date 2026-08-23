package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.FinancialMetricsDTO;
import com.alxnrocha.vaultledger.enums.AccountType;
import com.alxnrocha.vaultledger.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Service
public class FinancialMetricsService {

    private final AccountRepository accountRepository;

    public FinancialMetricsService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public FinancialMetricsDTO calculateSolvencyMetrics() {
        BigDecimal totalAssets = accountRepository.sumBalanceByType(AccountType.ASSET);
        BigDecimal totalLiabilities = accountRepository.sumBalanceByType(AccountType.LIABILITY);
        BigDecimal totalEquity = accountRepository.sumBalanceByType(AccountType.EQUITY);
        BigDecimal totalRevenue = accountRepository.sumBalanceByType(AccountType.REVENUE);
        BigDecimal totalExpenses = accountRepository.sumBalanceByType(AccountType.EXPENSE);

        // Net income = Revenue - Expenses
        BigDecimal netIncome = totalRevenue.subtract(totalExpenses);

        // Solvency Ratio = Assets / Liabilities (default to 1.0000 if 0 liabilities)
        BigDecimal solvencyRatio = (totalLiabilities.compareTo(BigDecimal.ZERO) > 0)
                ? totalAssets.divide(totalLiabilities, 4, RoundingMode.HALF_UP)
                : BigDecimal.ONE.setScale(4);

        // Equity to Asset = Equity / Assets (default to 0.0000 if 0 assets)
        BigDecimal equityToAssetRatio = (totalAssets.compareTo(BigDecimal.ZERO) > 0)
                ? totalEquity.divide(totalAssets, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(4);

        // Debt to Equity = Liabilities / Equity (default to 0.0000 if 0 equity)
        BigDecimal debtToEquityRatio = (totalEquity.compareTo(BigDecimal.ZERO) > 0)
                ? totalLiabilities.divide(totalEquity, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(4);

        // Balance Sheet equation verification: Assets == Liabilities + Equity
        BigDecimal totalClaims = totalLiabilities.add(totalEquity);
        boolean balanceSheetBalanced = totalAssets.compareTo(totalClaims) == 0;

        return new FinancialMetricsDTO(
                totalAssets,
                totalLiabilities,
                totalEquity,
                totalRevenue,
                totalExpenses,
                netIncome,
                solvencyRatio,
                equityToAssetRatio,
                debtToEquityRatio,
                balanceSheetBalanced,
                Instant.now()
        );
    }
}
