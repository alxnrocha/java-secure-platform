package com.alxnrocha.vaultledger.controller;

import com.alxnrocha.vaultledger.dto.AccountDTO;
import com.alxnrocha.vaultledger.dto.AccountHierarchyDTO;
import com.alxnrocha.vaultledger.dto.AccountSummaryDTO;
import com.alxnrocha.vaultledger.dto.CreateAccountDTO;
import com.alxnrocha.vaultledger.enums.AccountType;
import com.alxnrocha.vaultledger.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/accounts")
@Tag(name = "Accounts", description = "Chart of Accounts management, tree hierarchy, and nature breakdown")
@SecurityRequirement(name = "bearerAuth")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    @Operation(summary = "List all active accounts", description = "Returns active accounts sorted by numerical code.")
    public ResponseEntity<List<AccountDTO>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Account found"),
            @ApiResponse(responseCode = "400", description = "Account not found")
    })
    public ResponseEntity<AccountDTO> getAccountById(@PathVariable UUID id) {
        return ResponseEntity.ok(accountService.getAccountById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get account by code")
    public ResponseEntity<AccountDTO> getAccountByCode(@PathVariable String code) {
        return ResponseEntity.ok(accountService.getAccountByCode(code));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Filter accounts by nature type")
    public ResponseEntity<List<AccountDTO>> getAccountsByType(@PathVariable AccountType type) {
        return ResponseEntity.ok(accountService.getAccountsByType(type));
    }

    @GetMapping("/hierarchy")
    @Operation(summary = "Get Chart of Accounts hierarchy tree", description = "Returns nested parent-child tree structure.")
    public ResponseEntity<List<AccountHierarchyDTO>> getHierarchy() {
        return ResponseEntity.ok(accountService.getChartOfAccountsHierarchy());
    }

    @GetMapping("/summary")
    @Operation(summary = "Get aggregated balances by account type")
    public ResponseEntity<AccountSummaryDTO> getSummary() {
        return ResponseEntity.ok(accountService.getAccountSummary());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new account in Chart of Accounts", description = "Requires ROLE_ADMIN privilege.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Account created"),
            @ApiResponse(responseCode = "400", description = "Duplicate code or validation error"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<AccountDTO> createAccount(@Valid @RequestBody CreateAccountDTO request) {
        AccountDTO created = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
