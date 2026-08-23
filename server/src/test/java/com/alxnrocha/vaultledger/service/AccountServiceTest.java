package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.CreateAccountDTO;
import com.alxnrocha.vaultledger.entity.AccountEntity;
import com.alxnrocha.vaultledger.enums.AccountType;
import com.alxnrocha.vaultledger.repository.AccountRepository;
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
@DisplayName("Unit Tests — Chart of Accounts Service")
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    private AccountService accountService;

    @BeforeEach
    void setUp() {
        accountService = new AccountService(accountRepository);
    }

    @Test
    @DisplayName("Should retrieve all active accounts mapped to DTO")
    void testGetAllAccounts() {
        AccountEntity acc1 = new AccountEntity("1000", "Cash", AccountType.ASSET, "EUR", new BigDecimal("1000.0000"));
        AccountEntity acc2 = new AccountEntity("2000", "Client Deposits", AccountType.LIABILITY, "EUR", new BigDecimal("1000.0000"));

        when(accountRepository.findByActiveTrueOrderByCodeAsc()).thenReturn(List.of(acc1, acc2));

        var result = accountService.getAllAccounts();

        assertEquals(2, result.size());
        assertEquals("1000", result.get(0).code());
        assertEquals("DEBIT", result.get(0).normalBalance());
        assertEquals("2000", result.get(1).code());
        assertEquals("CREDIT", result.get(1).normalBalance());
    }

    @Test
    @DisplayName("Should create new account when code is unique")
    void testCreateAccountSuccess() {
        CreateAccountDTO dto = new CreateAccountDTO("1050", "Secondary Vault", AccountType.ASSET, "EUR", null);

        when(accountRepository.existsByCode("1050")).thenReturn(false);
        when(accountRepository.save(any(AccountEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        var created = accountService.createAccount(dto);

        assertNotNull(created);
        assertEquals("1050", created.code());
        assertEquals("Secondary Vault", created.name());
        assertEquals(AccountType.ASSET, created.type());
        verify(accountRepository, times(1)).save(any(AccountEntity.class));
    }

    @Test
    @DisplayName("Should reject account creation when duplicate code exists")
    void testCreateAccountDuplicateCode() {
        CreateAccountDTO dto = new CreateAccountDTO("1000", "Duplicate Cash", AccountType.ASSET, "EUR", null);

        when(accountRepository.existsByCode("1000")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> accountService.createAccount(dto));
        verify(accountRepository, never()).save(any(AccountEntity.class));
    }

    @Test
    @DisplayName("Should generate accurate account summary breakdown")
    void testGetAccountSummary() {
        when(accountRepository.sumBalanceByType(AccountType.ASSET)).thenReturn(new BigDecimal("10000.0000"));
        when(accountRepository.sumBalanceByType(AccountType.LIABILITY)).thenReturn(new BigDecimal("5000.0000"));
        when(accountRepository.sumBalanceByType(AccountType.EQUITY)).thenReturn(new BigDecimal("5000.0000"));
        when(accountRepository.sumBalanceByType(AccountType.REVENUE)).thenReturn(new BigDecimal("1000.0000"));
        when(accountRepository.sumBalanceByType(AccountType.EXPENSE)).thenReturn(new BigDecimal("200.0000"));
        when(accountRepository.count()).thenReturn(15L);

        var summary = accountService.getAccountSummary();

        assertNotNull(summary);
        assertEquals(new BigDecimal("10000.0000"), summary.totalAssets());
        assertEquals(new BigDecimal("5000.0000"), summary.totalLiabilities());
        assertEquals(15L, summary.totalAccountsCount());
    }
}
