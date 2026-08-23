package com.alxnrocha.vaultledger.controller;

import com.alxnrocha.vaultledger.dto.CreateLedgerEntryDTO;
import com.alxnrocha.vaultledger.dto.CreateTransactionDTO;
import com.alxnrocha.vaultledger.dto.ReversalRequestDTO;
import com.alxnrocha.vaultledger.entity.AccountEntity;
import com.alxnrocha.vaultledger.entity.TransactionEntity;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.enums.AccountType;
import com.alxnrocha.vaultledger.enums.EntryType;
import com.alxnrocha.vaultledger.enums.RoleType;
import com.alxnrocha.vaultledger.repository.AccountRepository;
import com.alxnrocha.vaultledger.repository.AuditLogRepository;
import com.alxnrocha.vaultledger.repository.LedgerEntryRepository;
import com.alxnrocha.vaultledger.repository.TransactionRepository;
import com.alxnrocha.vaultledger.repository.UserRepository;
import com.alxnrocha.vaultledger.security.JwtTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Integration Tests — Ledger, Accounts, Audit, and Metrics REST Endpoints")
class LedgerAndAuditApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private JwtTokenService jwtTokenService;

    private String adminJwt;
    private UserEntity adminUser;

    @BeforeEach
    void setUp() {
        ledgerEntryRepository.deleteAll();
        transactionRepository.deleteAll();
        auditLogRepository.deleteAll();
        accountRepository.deleteAll();
        userRepository.deleteAll();

        adminUser = new UserEntity(
                UUID.randomUUID(),
                "admin_ledger_test",
                "admin.ledger@vaultledger.internal",
                "$2a$12$e8Y6/5jN5b5FjL1.sZk7Ie2kL6L6Z6L6L6Z6L6L6Z6L6L6Z6L6L6Z",
                "Admin",
                "Root",
                RoleType.ROLE_ADMIN
        );
        userRepository.save(adminUser);
        adminJwt = jwtTokenService.generateAccessToken(adminUser);

        // Seed basic accounts
        AccountEntity cash = new AccountEntity("1000", "Cash Reserves", AccountType.ASSET, "EUR", new BigDecimal("50000.0000"));
        AccountEntity deposits = new AccountEntity("2000", "Customer Deposits", AccountType.LIABILITY, "EUR", new BigDecimal("50000.0000"));
        accountRepository.saveAll(List.of(cash, deposits));
    }

    @Test
    @DisplayName("GET /api/v1/accounts should return list of active accounts")
    void testGetAccounts() throws Exception {
        mockMvc.perform(get("/api/v1/accounts")
                        .header("Authorization", "Bearer " + adminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].code", is("1000")))
                .andExpect(jsonPath("$[1].code", is("2000")));
    }

    @Test
    @DisplayName("GET /api/v1/accounts/summary should return balance aggregations")
    void testGetAccountsSummary() throws Exception {
        mockMvc.perform(get("/api/v1/accounts/summary")
                        .header("Authorization", "Bearer " + adminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssets", is(50000.0)))
                .andExpect(jsonPath("$.totalLiabilities", is(50000.0)))
                .andExpect(jsonPath("$.totalAccountsCount", is(2)));
    }

    @Test
    @DisplayName("POST /api/v1/transfers should post balanced transaction and emit audit log")
    void testPostTransfer() throws Exception {
        CreateLedgerEntryDTO d1 = new CreateLedgerEntryDTO("1000", EntryType.DEBIT, new BigDecimal("10000.0000"), "Debit cash");
        CreateLedgerEntryDTO c1 = new CreateLedgerEntryDTO("2000", EntryType.CREDIT, new BigDecimal("10000.0000"), "Credit deposit");

        CreateTransactionDTO dto = new CreateTransactionDTO(
                "Interbank Liquidity Injection",
                "EUR",
                List.of(d1, c1)
        );

        mockMvc.perform(post("/api/v1/transfers")
                        .header("Authorization", "Bearer " + adminJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status", is("POSTED")))
                .andExpect(jsonPath("$.totalAmount", is(10000.0)))
                .andExpect(jsonPath("$.entries", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/v1/audit/verify should verify unbroken SHA-256 chain")
    void testVerifyAuditChain() throws Exception {
        // Trigger a transaction so audit log is appended
        CreateLedgerEntryDTO d1 = new CreateLedgerEntryDTO("1000", EntryType.DEBIT, new BigDecimal("5000.0000"), "Debit cash");
        CreateLedgerEntryDTO c1 = new CreateLedgerEntryDTO("2000", EntryType.CREDIT, new BigDecimal("5000.0000"), "Credit deposit");
        CreateTransactionDTO dto = new CreateTransactionDTO("Audit test transfer", "EUR", List.of(d1, c1));

        mockMvc.perform(post("/api/v1/transfers")
                        .header("Authorization", "Bearer " + adminJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/audit/verify")
                        .header("Authorization", "Bearer " + adminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid", is(true)))
                .andExpect(jsonPath("$.totalLogsChecked", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("GET /api/v1/metrics/solvency should compute solvency metrics")
    void testGetSolvencyMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/metrics/solvency")
                        .header("Authorization", "Bearer " + adminJwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAssets", is(50000.0)))
                .andExpect(jsonPath("$.totalLiabilities", is(50000.0)))
                .andExpect(jsonPath("$.solvencyRatio", is(1.0)));
    }
}
