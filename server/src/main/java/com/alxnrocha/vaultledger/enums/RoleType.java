package com.alxnrocha.vaultledger.enums;

/**
 * 4-Tier Granular Role-Based Access Control (RBAC) levels.
 */
public enum RoleType {
    ROLE_ADMIN("System Administrator - Full Access & Audit Oversight"),
    ROLE_OPERATOR("Financial Operator - Transfer & Journal Execution"),
    ROLE_AUDITOR("Forensic Auditor - Read-Only Ledger & Cryptographic Chain Inspector"),
    ROLE_COMPLIANCE_OFFICER("Compliance Officer - Risk Management & High-Value Approvals");

    private final String description;

    RoleType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
