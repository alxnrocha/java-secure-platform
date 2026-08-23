package com.alxnrocha.vaultledger.enums;

/**
 * Standard financial account classification for double-entry bookkeeping.
 * In double-entry accounting:
 * - ASSET & EXPENSE: Normal Debit balance (Debit increases, Credit decreases).
 * - LIABILITY, EQUITY & REVENUE: Normal Credit balance (Credit increases, Debit decreases).
 */
public enum AccountType {
    ASSET("Asset / Liquid Resource", true),
    LIABILITY("Liability / Deposit Obligation", false),
    EQUITY("Equity / Capital Reserve", false),
    REVENUE("Revenue / Fee Income", false),
    EXPENSE("Expense / Operational Cost", true);

    private final String description;
    private final boolean debitNormal;

    AccountType(String description, boolean debitNormal) {
        this.description = description;
        this.debitNormal = debitNormal;
    }

    public String getDescription() {
        return description;
    }

    public boolean isDebitNormal() {
        return debitNormal;
    }

    public boolean isCreditNormal() {
        return !debitNormal;
    }
}
