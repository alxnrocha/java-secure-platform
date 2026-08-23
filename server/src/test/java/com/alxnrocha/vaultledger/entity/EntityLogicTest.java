package com.alxnrocha.vaultledger.entity;

import com.alxnrocha.vaultledger.enums.AccountType;
import com.alxnrocha.vaultledger.enums.EntryType;
import com.alxnrocha.vaultledger.enums.RoleType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Tests — Double-Entry Entity & Accounting Logic")
class EntityLogicTest {

    @Test
    @DisplayName("Asset account should increase on Debit and decrease on Credit")
    void testAssetAccountAccountingMath() {
        AccountEntity asset = new AccountEntity("1000", "Cash", AccountType.ASSET, "EUR", new BigDecimal("1000.0000"));
        
        asset.debit(new BigDecimal("500.0000"));
        assertEquals(new BigDecimal("1500.0000"), asset.getBalance());

        asset.credit(new BigDecimal("200.0000"));
        assertEquals(new BigDecimal("1300.0000"), asset.getBalance());
    }

    @Test
    @DisplayName("Liability account should increase on Credit and decrease on Debit")
    void testLiabilityAccountAccountingMath() {
        AccountEntity liability = new AccountEntity("2000", "Deposits", AccountType.LIABILITY, "EUR", new BigDecimal("5000.0000"));

        liability.credit(new BigDecimal("1000.0000"));
        assertEquals(new BigDecimal("6000.0000"), liability.getBalance());

        liability.debit(new BigDecimal("2500.0000"));
        assertEquals(new BigDecimal("3500.0000"), liability.getBalance());
    }

    @Test
    @DisplayName("Equity account should increase on Credit")
    void testEquityAccountAccountingMath() {
        AccountEntity equity = new AccountEntity("3000", "Capital", AccountType.EQUITY, "EUR", new BigDecimal("10000.0000"));

        equity.credit(new BigDecimal("2000.0000"));
        assertEquals(new BigDecimal("12000.0000"), equity.getBalance());
    }

    @Test
    @DisplayName("Transaction should maintain list of balanced ledger entries")
    void testTransactionAddEntries() {
        UserEntity admin = new UserEntity(UUID.randomUUID(), "admin", "admin@vault.internal", "hash", "Admin", "User", RoleType.ROLE_ADMIN);
        TransactionEntity tx = new TransactionEntity("TX-001", "Transfer", new BigDecimal("100.0000"), "EUR", admin);

        AccountEntity acc1 = new AccountEntity("1000", "Cash", AccountType.ASSET, "EUR", BigDecimal.ZERO);
        AccountEntity acc2 = new AccountEntity("2000", "Deposits", AccountType.LIABILITY, "EUR", BigDecimal.ZERO);

        LedgerEntryEntity entry1 = new LedgerEntryEntity(tx, acc1, EntryType.DEBIT, new BigDecimal("100.0000"), new BigDecimal("100.0000"), "Debit entry");
        LedgerEntryEntity entry2 = new LedgerEntryEntity(tx, acc2, EntryType.CREDIT, new BigDecimal("100.0000"), new BigDecimal("100.0000"), "Credit entry");

        tx.addEntry(entry1);
        tx.addEntry(entry2);

        assertEquals(2, tx.getLedgerEntries().size());
        assertEquals(tx, entry1.getTransaction());
        assertEquals(tx, entry2.getTransaction());
    }
}
