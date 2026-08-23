package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.CreateLedgerEntryDTO;
import com.alxnrocha.vaultledger.dto.CreateTransactionDTO;
import com.alxnrocha.vaultledger.dto.FinancialMetricsDTO;
import com.alxnrocha.vaultledger.entity.AccountEntity;
import com.alxnrocha.vaultledger.entity.TransactionEntity;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.enums.AccountType;
import com.alxnrocha.vaultledger.enums.EntryType;
import com.alxnrocha.vaultledger.enums.RoleType;
import com.alxnrocha.vaultledger.enums.TransactionStatus;
import com.alxnrocha.vaultledger.repository.AccountRepository;
import com.alxnrocha.vaultledger.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Unit Tests — Accounting Reversals & Solvency Financial Metrics")
class TransactionReversalAndMetricsTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    private LedgerEngineService ledgerEngineService;
    private FinancialMetricsService financialMetricsService;
    private UserEntity testOperator;
    private AccountEntity cashAccount;
    private AccountEntity depositsAccount;

    @BeforeEach
    void setUp() {
        ledgerEngineService = new LedgerEngineService(transactionRepository, accountRepository);
        financialMetricsService = new FinancialMetricsService(accountRepository);

        testOperator = new UserEntity(
                UUID.randomUUID(),
                "operator",
                "operator@vaultledger.internal",
                "hash",
                "Carlos",
                "Mendoza",
                RoleType.ROLE_OPERATOR
        );

        cashAccount = new AccountEntity("1000", "Operational Cash", AccountType.ASSET, "EUR", new BigDecimal("10000.0000"));
        depositsAccount = new AccountEntity("2000", "Client Deposits", AccountType.LIABILITY, "EUR", new BigDecimal("10000.0000"));
    }

    @Test
    @DisplayName("Should execute transaction reversal, inverting entries and restoring account balances")
    void testReverseTransactionSuccess() {
        UUID origId = UUID.randomUUID();
        TransactionEntity origTx = new TransactionEntity("TX-ORIG-1", "Original Deposit", new BigDecimal("3000.0000"), "EUR", testOperator);
        origTx.setId(origId);
        origTx.setStatus(TransactionStatus.POSTED);

        // Original entries: Debit Cash 3000, Credit Deposits 3000 (after post: cash was 13000, deposits 13000)
        cashAccount.setBalance(new BigDecimal("13000.0000"));
        depositsAccount.setBalance(new BigDecimal("13000.0000"));

        var e1 = new com.alxnrocha.vaultledger.entity.LedgerEntryEntity(origTx, cashAccount, EntryType.DEBIT, new BigDecimal("3000.0000"), new BigDecimal("13000.0000"), "Debit cash");
        var e2 = new com.alxnrocha.vaultledger.entity.LedgerEntryEntity(origTx, depositsAccount, EntryType.CREDIT, new BigDecimal("3000.0000"), new BigDecimal("13000.0000"), "Credit deposits");
        origTx.addEntry(e1);
        origTx.addEntry(e2);

        when(transactionRepository.findById(origId)).thenReturn(Optional.of(origTx));
        when(accountRepository.findByCodeWithLock("1000")).thenReturn(Optional.of(cashAccount));
        when(accountRepository.findByCodeWithLock("2000")).thenReturn(Optional.of(depositsAccount));
        when(transactionRepository.save(any(TransactionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var reversalResult = ledgerEngineService.reverseTransaction(origId, "Erroneous posting rollback", testOperator);

        assertNotNull(reversalResult);
        assertEquals(TransactionStatus.REVERSED, origTx.getStatus());
        assertTrue(reversalResult.referenceNumber().startsWith("TX-REV-"));
        assertEquals(origId, reversalResult.reversalOfId());

        // Cash account was debited, reversal credits it back: 13000 - 3000 = 10000
        assertEquals(new BigDecimal("10000.0000"), cashAccount.getBalance());
        // Deposits account was credited, reversal debits it back: 13000 - 3000 = 10000
        assertEquals(new BigDecimal("10000.0000"), depositsAccount.getBalance());
    }

    @Test
    @DisplayName("Should reject reversal of already reversed transaction")
    void testRejectAlreadyReversedTransaction() {
        UUID origId = UUID.randomUUID();
        TransactionEntity alreadyReversed = new TransactionEntity("TX-ORIG-1", "Original", new BigDecimal("100.0000"), "EUR", testOperator);
        alreadyReversed.setId(origId);
        alreadyReversed.setStatus(TransactionStatus.REVERSED);

        when(transactionRepository.findById(origId)).thenReturn(Optional.of(alreadyReversed));

        assertThrows(IllegalStateException.class, () ->
                ledgerEngineService.reverseTransaction(origId, "Attempt double rollback", testOperator)
        );
    }

    @Test
    @DisplayName("Should accurately calculate solvency and financial ratios")
    void testCalculateSolvencyMetrics() {
        when(accountRepository.sumBalanceByType(AccountType.ASSET)).thenReturn(new BigDecimal("20000000.0000"));
        when(accountRepository.sumBalanceByType(AccountType.LIABILITY)).thenReturn(new BigDecimal("8000000.0000"));
        when(accountRepository.sumBalanceByType(AccountType.EQUITY)).thenReturn(new BigDecimal("12000000.0000"));
        when(accountRepository.sumBalanceByType(AccountType.REVENUE)).thenReturn(new BigDecimal("1500000.0000"));
        when(accountRepository.sumBalanceByType(AccountType.EXPENSE)).thenReturn(new BigDecimal("500000.0000"));

        FinancialMetricsDTO metrics = financialMetricsService.calculateSolvencyMetrics();

        assertNotNull(metrics);
        assertEquals(new BigDecimal("1000000.0000"), metrics.netIncome()); // 1.5M - 0.5M = 1.0M
        assertEquals(new BigDecimal("2.5000"), metrics.solvencyRatio()); // 20M / 8M = 2.5
        assertEquals(new BigDecimal("0.6000"), metrics.equityToAssetRatio()); // 12M / 20M = 0.6
        assertEquals(new BigDecimal("0.6667"), metrics.debtToEquityRatio()); // 8M / 12M = 0.6667
        assertTrue(metrics.balanceSheetBalanced()); // 20M == 8M + 12M
    }
}
