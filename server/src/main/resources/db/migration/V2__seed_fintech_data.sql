-- ============================================================================
-- VAULTLEDGER CORE - V2__seed_fintech_data.sql
-- Initial Enterprise Seed Dataset (Users, Chart of Accounts, Journal Entries)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. SEED USERS (BCrypt hashes for password: "Password@123")
-- ----------------------------------------------------------------------------
-- Password: "Password@123" -> $2a$10$7EqJtq98hPqEX7fNZaFWoOhuhiODW9iX8q.Kx/K.KzJpZ1QxYn33a
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, is_active, mfa_enabled)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'admin', 'admin@vaultledger.internal', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhuhiODW9iX8q.Kx/K.KzJpZ1QxYn33a', 'Alexandre', 'Rocha', 'ROLE_ADMIN', true, true),
    ('a0000000-0000-0000-0000-000000000002', 'operator', 'operator@vaultledger.internal', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhuhiODW9iX8q.Kx/K.KzJpZ1QxYn33a', 'Carlos', 'Mendoza', 'ROLE_OPERATOR', true, false),
    ('a0000000-0000-0000-0000-000000000003', 'auditor', 'auditor@vaultledger.internal', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhuhiODW9iX8q.Kx/K.KzJpZ1QxYn33a', 'Elena', 'Vargas', 'ROLE_AUDITOR', true, false),
    ('a0000000-0000-0000-0000-000000000004', 'compliance', 'compliance@vaultledger.internal', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhuhiODW9iX8q.Kx/K.KzJpZ1QxYn33a', 'Sofia', 'Alarcón', 'ROLE_COMPLIANCE_OFFICER', true, true)
ON CONFLICT (username) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. SEED CHART OF ACCOUNTS (PLANO DE CONTAS)
-- ----------------------------------------------------------------------------
INSERT INTO accounts (id, code, name, type, currency, balance, is_active)
VALUES
    -- ASSETS (1000 - 1999)
    ('b0000000-0000-0000-0000-000000000001', '1000', 'Operational Cash Reserve', 'ASSET', 'EUR', 2500000.0000, true),
    ('b0000000-0000-0000-0000-000000000002', '1010', 'Central Treasury Liquid Vault', 'ASSET', 'EUR', 10000000.0000, true),
    ('b0000000-0000-0000-0000-000000000003', '1020', 'Customer Segregated Custody', 'ASSET', 'EUR', 7850000.0000, true),
    ('b0000000-0000-0000-0000-000000000004', '1030', 'Interbank Settlement Clearing', 'ASSET', 'EUR', 1200000.0000, true),

    -- LIABILITIES (2000 - 2999)
    ('b0000000-0000-0000-0000-000000000005', '2000', 'Client Deposit Liabilities', 'LIABILITY', 'EUR', 7850000.0000, true),
    ('b0000000-0000-0000-0000-000000000006', '2010', 'Settlement Clearing Obligations', 'LIABILITY', 'EUR', 1200000.0000, true),
    ('b0000000-0000-0000-0000-000000000007', '2020', 'Withholding Tax & Regulatory Accruals', 'LIABILITY', 'EUR', 350000.0000, true),

    -- EQUITY (3000 - 3999)
    ('b0000000-0000-0000-0000-000000000008', '3000', 'Paid-in Venture Equity', 'EQUITY', 'EUR', 11500000.0000, true),
    ('b0000000-0000-0000-0000-000000000009', '3010', 'Retained Earnings & Reserves', 'EQUITY', 'EUR', 350000.0000, true),

    -- REVENUES (4000 - 4999)
    ('b0000000-0000-0000-0000-000000000010', '4000', 'Interchange & FX Spread Revenue', 'REVENUE', 'EUR', 625000.0000, true),
    ('b0000000-0000-0000-0000-000000000011', '4010', 'Prime Brokerage Fee Income', 'REVENUE', 'EUR', 175000.0000, true),

    -- EXPENSES (5000 - 5999)
    ('b0000000-0000-0000-0000-000000000012', '5000', 'SWIFT & SEPA Network Liquidity Expense', 'EXPENSE', 'EUR', 345000.0000, true),
    ('b0000000-0000-0000-0000-000000000013', '5010', 'Cloud Infrastructure & Security Audit', 'EXPENSE', 'EUR', 105000.0000, true)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3. SEED BALANCED TRANSACTIONS & DOUBLE-ENTRY JOURNAL
-- ----------------------------------------------------------------------------
-- Transaction 1: Capital Influx (Equity to Central Treasury)
INSERT INTO transactions (id, reference_number, description, status, total_amount, currency, created_by_user_id, posted_at)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'TX-2026-001',
    'Initial Tier-1 Regulatory Capital Injection',
    'POSTED',
    11500000.0000,
    'EUR',
    'a0000000-0000-0000-0000-000000000001',
    CURRENT_TIMESTAMP - INTERVAL '30 days'
) ON CONFLICT (reference_number) DO NOTHING;

-- Entries for Tx 1: DEBIT Central Treasury (Asset increases), CREDIT Paid-in Equity (Equity increases)
INSERT INTO ledger_entries (id, transaction_id, account_id, entry_type, amount, running_balance, description)
VALUES 
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'DEBIT', 11500000.0000, 11500000.0000, 'Debit to Central Treasury Liquid Vault'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 'CREDIT', 11500000.0000, 11500000.0000, 'Credit to Paid-in Venture Equity')
ON CONFLICT (id) DO NOTHING;

-- Transaction 2: Corporate Customer Deposit
INSERT INTO transactions (id, reference_number, description, status, total_amount, currency, created_by_user_id, posted_at)
VALUES (
    'c0000000-0000-0000-0000-000000000002',
    'TX-2026-002',
    'Institutional Liquidity Inbound Custody Deposit - Atlas Prime Ltd',
    'POSTED',
    7850000.0000,
    'EUR',
    'a0000000-0000-0000-0000-000000000002',
    CURRENT_TIMESTAMP - INTERVAL '15 days'
) ON CONFLICT (reference_number) DO NOTHING;

-- Entries for Tx 2: DEBIT Customer Custody (Asset increases), CREDIT Client Deposit Liabilities (Liability increases)
INSERT INTO ledger_entries (id, transaction_id, account_id, entry_type, amount, running_balance, description)
VALUES 
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'DEBIT', 7850000.0000, 7850000.0000, 'Debit to Customer Segregated Custody Vault'),
    ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000005', 'CREDIT', 7850000.0000, 7850000.0000, 'Credit to Client Deposit Liabilities')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. GENESIS AUDIT LOG RECORD (CHAINED SHA-256)
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (
    id, action, entity_name, entity_id, user_id, user_email, ip_address, payload_before, payload_after, previous_hash, current_hash, created_at
) VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'GENESIS_INIT',
    'SYSTEM',
    'VAULTLEDGER_CORE',
    'a0000000-0000-0000-0000-000000000001',
    'admin@vaultledger.internal',
    '127.0.0.1',
    NULL,
    '{"system": "VaultLedger Core", "version": "1.0.0", "status": "INITIALIZED", "engine": "Double-Entry Engine v1"}'::jsonb,
    '0000000000000000000000000000000000000000000000000000000000000000',
    '8f434346648f6b96df89dda901c5176b10e6d0ceec3e16182e12e000a2852b7b',
    CURRENT_TIMESTAMP - INTERVAL '30 days'
) ON CONFLICT (current_hash) DO NOTHING;
