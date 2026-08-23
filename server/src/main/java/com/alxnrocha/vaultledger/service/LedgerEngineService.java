package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.CreateLedgerEntryDTO;
import com.alxnrocha.vaultledger.dto.CreateTransactionDTO;
import com.alxnrocha.vaultledger.dto.LedgerEntryDTO;
import com.alxnrocha.vaultledger.dto.TransactionDTO;
import com.alxnrocha.vaultledger.dto.UserProfileDTO;
import com.alxnrocha.vaultledger.entity.AccountEntity;
import com.alxnrocha.vaultledger.entity.LedgerEntryEntity;
import com.alxnrocha.vaultledger.entity.TransactionEntity;
import com.alxnrocha.vaultledger.entity.UserEntity;
import com.alxnrocha.vaultledger.enums.EntryType;
import com.alxnrocha.vaultledger.enums.TransactionStatus;
import com.alxnrocha.vaultledger.repository.AccountRepository;
import com.alxnrocha.vaultledger.repository.TransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class LedgerEngineService {

    private static final Logger log = LoggerFactory.getLogger(LedgerEngineService.class);

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public LedgerEngineService(
            TransactionRepository transactionRepository,
            AccountRepository accountRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    /**
     * Executes an atomic double-entry journal transaction with Serializable Isolation.
     * Guarantees invariant: SUM(Debits) == SUM(Credits) > 0.
     * Prevents database deadlocks by acquiring pessimistic write locks in strict alphabetical code order.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TransactionDTO postTransaction(CreateTransactionDTO dto, UserEntity currentUser) {
        if (dto.entries() == null || dto.entries().size() < 2) {
            throw new IllegalArgumentException("A valid double-entry transaction requires at least 2 entries (at least 1 debit and 1 credit).");
        }

        // 1. Calculate and validate total debits vs total credits
        BigDecimal totalDebits = BigDecimal.ZERO.setScale(4);
        BigDecimal totalCredits = BigDecimal.ZERO.setScale(4);

        for (CreateLedgerEntryDTO entry : dto.entries()) {
            if (entry.amount() == null || entry.amount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Entry amount must be strictly greater than zero.");
            }
            if (entry.entryType() == EntryType.DEBIT) {
                totalDebits = totalDebits.add(entry.amount());
            } else if (entry.entryType() == EntryType.CREDIT) {
                totalCredits = totalCredits.add(entry.amount());
            }
        }

        if (totalDebits.compareTo(totalCredits) != 0) {
            throw new IllegalArgumentException(String.format(
                    "Double-entry invariant violated: Total Debits (%s) must equal Total Credits (%s)",
                    totalDebits, totalCredits
            ));
        }

        if (totalDebits.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transaction total volume must be strictly positive.");
        }

        // 2. Lock accounts in deterministic alphabetical order to prevent deadlocks
        Set<String> uniqueCodes = new TreeSet<>();
        for (CreateLedgerEntryDTO entry : dto.entries()) {
            uniqueCodes.add(entry.accountCode());
        }

        Map<String, AccountEntity> lockedAccounts = new HashMap<>();
        for (String code : uniqueCodes) {
            AccountEntity account = accountRepository.findByCodeWithLock(code)
                    .orElseThrow(() -> new IllegalArgumentException("Account with code " + code + " does not exist"));
            if (!account.isActive()) {
                throw new IllegalStateException("Account " + code + " (" + account.getName() + ") is inactive/frozen.");
            }
            lockedAccounts.put(code, account);
        }

        // 3. Create Transaction Entity
        String refNumber = generateReferenceNumber("TX");
        String currency = (dto.currency() != null && !dto.currency().isBlank()) ? dto.currency() : "EUR";
        TransactionEntity transaction = new TransactionEntity(refNumber, dto.description(), totalDebits, currency, currentUser);

        // 4. Process each entry, mutate account balance, snapshot running balance
        for (CreateLedgerEntryDTO entryDto : dto.entries()) {
            AccountEntity account = lockedAccounts.get(entryDto.accountCode());

            if (entryDto.entryType() == EntryType.DEBIT) {
                account.debit(entryDto.amount());
            } else {
                account.credit(entryDto.amount());
            }

            accountRepository.save(account);

            LedgerEntryEntity entryEntity = new LedgerEntryEntity(
                    transaction,
                    account,
                    entryDto.entryType(),
                    entryDto.amount(),
                    account.getBalance(),
                    entryDto.description()
            );

            transaction.addEntry(entryEntity);
        }

        TransactionEntity saved = transactionRepository.save(transaction);
        log.info("Posted balanced transaction: {} | Volume: {} EUR | Entries: {}", refNumber, totalDebits, saved.getLedgerEntries().size());

        return mapToDTO(saved);
    }

    /**
     * Executes an accounting reversal of an existing posted transaction.
     * Inverts all debit and credit movements, updates original status to REVERSED, and records the reversal transaction.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public TransactionDTO reverseTransaction(UUID originalTransactionId, String reason, UserEntity operator) {
        TransactionEntity original = transactionRepository.findById(originalTransactionId)
                .orElseThrow(() -> new IllegalArgumentException("Original transaction not found with ID: " + originalTransactionId));

        if (original.getStatus() != TransactionStatus.POSTED) {
            throw new IllegalStateException("Only POSTED transactions can be reversed. Current status: " + original.getStatus());
        }

        // Mark original as REVERSED
        original.setStatus(TransactionStatus.REVERSED);
        transactionRepository.save(original);

        // Deterministically lock all involved accounts
        Set<String> uniqueCodes = new TreeSet<>();
        for (LedgerEntryEntity entry : original.getLedgerEntries()) {
            uniqueCodes.add(entry.getAccount().getCode());
        }

        Map<String, AccountEntity> lockedAccounts = new HashMap<>();
        for (String code : uniqueCodes) {
            AccountEntity account = accountRepository.findByCodeWithLock(code)
                    .orElseThrow(() -> new IllegalArgumentException("Account with code " + code + " does not exist"));
            lockedAccounts.put(code, account);
        }

        // Create Reversal Transaction
        String refNumber = generateReferenceNumber("TX-REV");
        String desc = "Reversal of " + original.getReferenceNumber() + ": " + reason;
        TransactionEntity reversal = new TransactionEntity(refNumber, desc, original.getTotalAmount(), original.getCurrency(), operator);
        reversal.setReversalOf(original);

        // Invert entries: DEBIT -> CREDIT, CREDIT -> DEBIT
        for (LedgerEntryEntity origEntry : original.getLedgerEntries()) {
            AccountEntity account = lockedAccounts.get(origEntry.getAccount().getCode());
            EntryType invertedType = (origEntry.getEntryType() == EntryType.DEBIT) ? EntryType.CREDIT : EntryType.DEBIT;

            if (invertedType == EntryType.DEBIT) {
                account.debit(origEntry.getAmount());
            } else {
                account.credit(origEntry.getAmount());
            }
            accountRepository.save(account);

            LedgerEntryEntity reversalEntry = new LedgerEntryEntity(
                    reversal,
                    account,
                    invertedType,
                    origEntry.getAmount(),
                    account.getBalance(),
                    "Reversal item for entry " + origEntry.getId()
            );
            reversal.addEntry(reversalEntry);
        }

        TransactionEntity savedReversal = transactionRepository.save(reversal);
        log.info("Successfully executed accounting reversal: {} for original TX: {}", refNumber, original.getReferenceNumber());

        return mapToDTO(savedReversal);
    }

    @Transactional(readOnly = true)
    public TransactionDTO getTransactionById(UUID id) {
        return transactionRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public TransactionDTO getTransactionByReference(String referenceNumber) {
        return transactionRepository.findByReferenceNumber(referenceNumber)
                .map(this::mapToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found with reference: " + referenceNumber));
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getRecentTransactions() {
        return transactionRepository.findTop20ByOrderByPostedAtDesc()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<TransactionDTO> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAllByOrderByPostedAtDesc(pageable)
                .map(this::mapToDTO);
    }

    private String generateReferenceNumber(String prefix) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + "-" + datePart + "-" + randomPart;
    }

    public TransactionDTO mapToDTO(TransactionEntity entity) {
        UserProfileDTO userProfile = null;
        if (entity.getCreatedByUser() != null) {
            UserEntity u = entity.getCreatedByUser();
            userProfile = new UserProfileDTO(
                    u.getId(), u.getUsername(), u.getEmail(),
                    u.getFirstName(), u.getLastName(), u.getRole(),
                    u.isActive(), u.isMfaEnabled(), u.getCreatedAt()
            );
        }

        List<LedgerEntryDTO> entries = entity.getLedgerEntries().stream().map(e -> new LedgerEntryDTO(
                e.getId(),
                entity.getId(),
                e.getAccount().getId(),
                e.getAccount().getCode(),
                e.getAccount().getName(),
                e.getEntryType(),
                e.getAmount(),
                e.getRunningBalance(),
                e.getDescription(),
                e.getCreatedAt()
        )).toList();

        return new TransactionDTO(
                entity.getId(),
                entity.getReferenceNumber(),
                entity.getDescription(),
                entity.getStatus(),
                entity.getTotalAmount(),
                entity.getCurrency(),
                entity.getReversalOf() != null ? entity.getReversalOf().getId() : null,
                userProfile,
                entity.getPostedAt(),
                entries
        );
    }
}
