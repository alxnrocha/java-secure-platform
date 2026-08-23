import { describe, it, expect, beforeEach } from 'vitest';
import { mockDatabase } from './mockDatabase';
import { MOCK_USERS } from '../stores/authStore';

describe('MockDatabase & In-Browser Double-Entry Ledger Engine', () => {
  beforeEach(() => {
    mockDatabase.resetDatabase();
  });

  it('should initialize with standard Chart of Accounts', () => {
    const accounts = mockDatabase.getAccounts();
    expect(accounts.length).toBeGreaterThanOrEqual(9);

    const cash = mockDatabase.getAccountByCode('1000');
    expect(cash).toBeDefined();
    expect(cash?.type).toBe('ASSET');
    expect(cash?.balance).toBe(11500000.0);
  });

  it('should calculate accurate account summary by nature', () => {
    const summary = mockDatabase.getAccountSummary();
    expect(summary.totalAssets).toBe(21550000.0);
    expect(summary.totalLiabilities).toBe(9400000.0);
    expect(summary.totalEquity).toBe(11800000.0);
  });

  it('should execute balanced double-entry transaction and update balances', async () => {
    const cashBefore = mockDatabase.getAccountByCode('1000')!.balance;
    const depositsBefore = mockDatabase.getAccountByCode('2000')!.balance;

    const tx = await mockDatabase.postTransaction(
      {
        description: 'Depósito de efectivo operacional',
        currency: 'EUR',
        entries: [
          { accountCode: '1000', entryType: 'DEBIT', amount: 50000.0 },
          { accountCode: '2000', entryType: 'CREDIT', amount: 50000.0 },
        ],
      },
      MOCK_USERS.ROLE_OPERATOR
    );

    expect(tx).toBeDefined();
    expect(tx.status).toBe('POSTED');
    expect(tx.totalAmount).toBe(50000.0);

    const cashAfter = mockDatabase.getAccountByCode('1000')!.balance;
    const depositsAfter = mockDatabase.getAccountByCode('2000')!.balance;

    // Asset debit increases: 11.5M + 50k
    expect(cashAfter).toBe(cashBefore + 50000.0);
    // Liability credit increases: 7.85M + 50k
    expect(depositsAfter).toBe(depositsBefore + 50000.0);
  });

  it('should reject unbalanced transaction invariant (Debits != Credits)', async () => {
    await expect(
      mockDatabase.postTransaction(
        {
          description: 'Intento desbalanceado',
          entries: [
            { accountCode: '1000', entryType: 'DEBIT', amount: 50000.0 },
            { accountCode: '2000', entryType: 'CREDIT', amount: 40000.0 },
          ],
        },
        MOCK_USERS.ROLE_OPERATOR
      )
    ).rejects.toThrow('Invariante de partida doble violado');
  });

  it('should execute transaction reversal and restore balances', async () => {
    const cashBefore = mockDatabase.getAccountByCode('1000')!.balance;

    const tx = await mockDatabase.postTransaction(
      {
        description: 'Transferencia para estornar',
        entries: [
          { accountCode: '1000', entryType: 'DEBIT', amount: 20000.0 },
          { accountCode: '2000', entryType: 'CREDIT', amount: 20000.0 },
        ],
      },
      MOCK_USERS.ROLE_OPERATOR
    );

    expect(mockDatabase.getAccountByCode('1000')!.balance).toBe(cashBefore + 20000.0);

    const rev = await mockDatabase.reverseTransaction(
      tx.id,
      'Error de captura',
      MOCK_USERS.ROLE_COMPLIANCE_OFFICER
    );

    expect(rev.status).toBe('POSTED');
    expect(tx.status).toBe('REVERSED');
    // Restored balance
    expect(mockDatabase.getAccountByCode('1000')!.balance).toBe(cashBefore);
  });

  it('should verify unbroken SHA-256 audit chain integrity', async () => {
    // Post a transaction to append block
    await mockDatabase.postTransaction(
      {
        description: 'Audit trail post',
        entries: [
          { accountCode: '1000', entryType: 'DEBIT', amount: 10000.0 },
          { accountCode: '2000', entryType: 'CREDIT', amount: 10000.0 },
        ],
      },
      MOCK_USERS.ROLE_ADMIN
    );

    const result = await mockDatabase.verifyAuditChain();
    expect(result.valid).toBe(true);
    expect(result.totalLogsChecked).toBeGreaterThanOrEqual(2);
    expect(result.brokenLogId).toBeNull();
  });

  it('should detect simulated database tampering in audit chain', async () => {
    await mockDatabase.postTransaction(
      {
        description: 'Audit trail tamper test',
        entries: [
          { accountCode: '1000', entryType: 'DEBIT', amount: 10000.0 },
          { accountCode: '2000', entryType: 'CREDIT', amount: 10000.0 },
        ],
      },
      MOCK_USERS.ROLE_ADMIN
    );

    // Tamper with latest block
    mockDatabase.simulateTamper();

    const result = await mockDatabase.verifyAuditChain();
    expect(result.valid).toBe(false);
    expect(result.brokenLogId).toBeDefined();
    expect(result.message).toContain('Manipulación detectada');
  });

  it('should compute solvency ratios and balance sheet balance', () => {
    const metrics = mockDatabase.getSolvencyMetrics();
    expect(metrics.totalAssets).toBe(21550000.0);
    expect(metrics.totalLiabilities).toBe(9400000.0);
    expect(metrics.solvencyRatio).toBeCloseTo(2.2926, 2);
    expect(metrics.balanceSheetBalanced).toBe(true);
  });
});
