package com.alxnrocha.vaultledger.controller;

import com.alxnrocha.vaultledger.dto.CreateTransactionDTO;
import com.alxnrocha.vaultledger.dto.ReversalRequestDTO;
import com.alxnrocha.vaultledger.dto.TransactionDTO;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.repository.UserRepository;
import com.alxnrocha.vaultledger.security.CustomUserDetails;
import com.alxnrocha.vaultledger.service.AuditLogService;
import com.alxnrocha.vaultledger.service.LedgerEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transfers")
@Tag(name = "Transactions & Transfers", description = "Double-entry journal transaction engine and reversal execution")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final LedgerEngineService ledgerEngineService;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    public TransactionController(
            LedgerEngineService ledgerEngineService,
            AuditLogService auditLogService,
            UserRepository userRepository
    ) {
        this.ledgerEngineService = ledgerEngineService;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    @Operation(summary = "Post double-entry journal transaction", description = "Atomically applies balanced debit and credit entries with serializable isolation.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transaction posted"),
            @ApiResponse(responseCode = "400", description = "Double-entry invariant violated or invalid account"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<TransactionDTO> postTransaction(
            @Valid @RequestBody CreateTransactionDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest
    ) {
        UserEntity currentUser = resolveUser(userDetails);
        TransactionDTO transaction = ledgerEngineService.postTransaction(request, currentUser);

        // Record forensic audit log
        auditLogService.recordAuditLog(
                "POST_TRANSACTION",
                "TransactionEntity",
                transaction.id().toString(),
                currentUser,
                httpRequest.getRemoteAddr(),
                null,
                String.format("{\"reference\": \"%s\", \"amount\": %s, \"entries\": %d}",
                        transaction.referenceNumber(), transaction.totalAmount(), transaction.entries().size())
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(transaction);
    }

    @PostMapping("/{id}/reverse")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPLIANCE_OFFICER')")
    @Operation(summary = "Execute accounting transaction reversal", description = "Inverts all original debit/credit line items and updates original status to REVERSED.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reversal executed"),
            @ApiResponse(responseCode = "400", description = "Transaction cannot be reversed or already reversed"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<TransactionDTO> reverseTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody ReversalRequestDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletRequest httpRequest
    ) {
        UserEntity currentUser = resolveUser(userDetails);
        TransactionDTO reversal = ledgerEngineService.reverseTransaction(id, request.reason(), currentUser);

        // Record forensic audit log
        auditLogService.recordAuditLog(
                "REVERSE_TRANSACTION",
                "TransactionEntity",
                reversal.id().toString(),
                currentUser,
                httpRequest.getRemoteAddr(),
                String.format("{\"originalTransactionId\": \"%s\"}", id),
                String.format("{\"reversalReference\": \"%s\", \"reason\": \"%s\"}", reversal.referenceNumber(), request.reason())
        );

        return ResponseEntity.ok(reversal);
    }

    @GetMapping
    @Operation(summary = "Get list of transactions (paged or recent)")
    public ResponseEntity<List<TransactionDTO>> getRecentTransactions() {
        return ResponseEntity.ok(ledgerEngineService.getRecentTransactions());
    }

    @GetMapping("/paged")
    @Operation(summary = "Get paginated transactions")
    public ResponseEntity<Page<TransactionDTO>> getPagedTransactions(Pageable pageable) {
        return ResponseEntity.ok(ledgerEngineService.getAllTransactions(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<TransactionDTO> getTransactionById(@PathVariable UUID id) {
        return ResponseEntity.ok(ledgerEngineService.getTransactionById(id));
    }

    @GetMapping("/ref/{referenceNumber}")
    @Operation(summary = "Get transaction by reference number")
    public ResponseEntity<TransactionDTO> getTransactionByReference(@PathVariable String referenceNumber) {
        return ResponseEntity.ok(ledgerEngineService.getTransactionByReference(referenceNumber));
    }

    private UserEntity resolveUser(CustomUserDetails userDetails) {
        if (userDetails != null && userDetails.getUser() != null) {
            return userDetails.getUser();
        }
        return userRepository.findAll().stream().findFirst().orElse(null);
    }
}
