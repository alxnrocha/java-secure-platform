package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.CreateLedgerEntryDTO;
import com.alxnrocha.vaultledger.dto.CreateTransactionDTO;
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
@DisplayName("Unit Tests — Double-Entry Transaction Engine & Mathematical Invariant")
class LedgerEngineServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    private LedgerEngineService ledgerEngineService;
    private UserEntity testOperator;
    private AccountEntity cashAccount;
    private AccountEntity depositsAccount;

    @BeforeEach
    void setUp() {
        ledgerEngineService = new LedgerEngineService(transactionRepository, accountRepository);

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
    @DisplayName("Should successfully post balanced double-entry transaction and mutate balances")
    void testPostBalancedTransactionSuccess() {
        CreateLedgerEntryDTO debitEntry = new CreateLedgerEntryDTO("1000", EntryType.DEBIT, new BigDecimal("5000.0000"), "Debit cash");
        CreateLedgerEntryDTO creditEntry = new CreateLedgerEntryDTO("2000", EntryType.CREDIT, new BigDecimal("5000.0000"), "Credit deposits");

        CreateTransactionDTO dto = new CreateTransactionDTO(
                "Deposit from institutional customer",
                "EUR",
                List.of(debitEntry, creditEntry)
        );

        when(accountRepository.findByCodeWithLock("1000")).thenReturn(Optional.of(cashAccount));
        when(accountRepository.findByCodeWithLock("2000")).thenReturn(Optional.of(depositsAccount));
        when(transactionRepository.save(any(TransactionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var result = ledgerEngineService.postTransaction(dto, testOperator);

        assertNotNull(result);
        assertEquals(TransactionStatus.POSTED, result.status());
        assertEquals(new BigDecimal("5000.0000"), result.totalAmount());
        assertEquals(2, result.entries().size());

        // Verify account balance mutations:
        // Asset (10000 + 5000 = 15000)
        assertEquals(new BigDecimal("15000.0000"), cashAccount.getBalance());
        // Liability (10000 + 5000 = 15000)
        assertEquals(new BigDecimal("15000.0000"), depositsAccount.getBalance());

        verify(accountRepository, times(2)).save(any(AccountEntity.class));
        verify(transactionRepository, times(1)).save(any(TransactionEntity.class));
    }

    @Test
    @DisplayName("Should strictly reject unbalanced transaction (Debits != Credits)")
    void testRejectUnbalancedTransaction() {
        CreateLedgerEntryDTO debitEntry = new CreateLedgerEntryDTO("1000", EntryType.DEBIT, new BigDecimal("5000.0000"), "Debit cash");
        CreateLedgerEntryDTO creditEntry = new CreateLedgerEntryDTO("2000", EntryType.CREDIT, new BigDecimal("4000.0000"), "Unbalanced credit");

        CreateTransactionDTO dto = new CreateTransactionDTO(
                "Unbalanced fraudulent attempt",
                "EUR",
                List.of(debitEntry, creditEntry)
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                ledgerEngineService.postTransaction(dto, testOperator)
        );

        assertTrue(ex.getMessage().contains("Double-entry invariant violated"));
        verify(transactionRepository, never()).save(any(TransactionEntity.class));
    }

    @Test
    @DisplayName("Should reject transaction with less than 2 entries")
    void testRejectSingleEntryTransaction() {
        CreateLedgerEntryDTO debitEntry = new CreateLedgerEntryDTO("1000", EntryType.DEBIT, new BigDecimal("5000.0000"), "Single entry");

        CreateTransactionDTO dto = new CreateTransactionDTO(
                "Single entry attempt",
                "EUR",
                List.of(debitEntry)
        );

        assertThrows(IllegalArgumentException.class, () ->
                ledgerEngineService.postTransaction(dto, testOperator)
        );
    }
}
