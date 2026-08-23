package com.alxnrocha.vaultledger.service;

import com.alxnrocha.vaultledger.dto.AccountDTO;
import com.alxnrocha.vaultledger.dto.AccountHierarchyDTO;
import com.alxnrocha.vaultledger.dto.AccountSummaryDTO;
import com.alxnrocha.vaultledger.dto.CreateAccountDTO;
import com.alxnrocha.vaultledger.entity.AccountEntity;
import com.alxnrocha.vaultledger.enums.AccountType;
import com.alxnrocha.vaultledger.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional(readOnly = true)
    public List<AccountDTO> getAllAccounts() {
        return accountRepository.findByActiveTrueOrderByCodeAsc()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountDTO getAccountById(UUID id) {
        return accountRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public AccountDTO getAccountByCode(String code) {
        return accountRepository.findByCode(code)
                .map(this::mapToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Account not found with code: " + code));
    }

    @Transactional(readOnly = true)
    public List<AccountDTO> getAccountsByType(AccountType type) {
        return accountRepository.findByType(type)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Transactional
    public AccountDTO createAccount(CreateAccountDTO dto) {
        if (accountRepository.existsByCode(dto.code())) {
            throw new IllegalArgumentException("Account with code " + dto.code() + " already exists");
        }

        AccountEntity entity = new AccountEntity(
                dto.code(),
                dto.name(),
                dto.type(),
                (dto.currency() != null && !dto.currency().isBlank()) ? dto.currency() : "EUR",
                BigDecimal.ZERO
        );

        if (dto.parentAccountId() != null) {
            AccountEntity parent = accountRepository.findById(dto.parentAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent account not found: " + dto.parentAccountId()));
            entity.setParentAccount(parent);
        }

        AccountEntity saved = accountRepository.save(entity);
        return mapToDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<AccountHierarchyDTO> getChartOfAccountsHierarchy() {
        List<AccountEntity> all = accountRepository.findByActiveTrueOrderByCodeAsc();
        Map<UUID, List<AccountEntity>> parentMap = all.stream()
                .filter(a -> a.getParentAccount() != null)
                .collect(Collectors.groupingBy(a -> a.getParentAccount().getId()));

        return all.stream()
                .filter(a -> a.getParentAccount() == null)
                .map(root -> buildHierarchyNode(root, parentMap))
                .toList();
    }

    private AccountHierarchyDTO buildHierarchyNode(AccountEntity node, Map<UUID, List<AccountEntity>> parentMap) {
        List<AccountEntity> children = parentMap.getOrDefault(node.getId(), Collections.emptyList());
        List<AccountHierarchyDTO> subNodes = children.stream()
                .map(child -> buildHierarchyNode(child, parentMap))
                .toList();

        return new AccountHierarchyDTO(
                node.getId(),
                node.getCode(),
                node.getName(),
                node.getType(),
                node.getCurrency(),
                node.getBalance(),
                node.isActive(),
                subNodes
        );
    }

    @Transactional(readOnly = true)
    public AccountSummaryDTO getAccountSummary() {
        BigDecimal assets = accountRepository.sumBalanceByType(AccountType.ASSET);
        BigDecimal liabilities = accountRepository.sumBalanceByType(AccountType.LIABILITY);
        BigDecimal equity = accountRepository.sumBalanceByType(AccountType.EQUITY);
        BigDecimal revenue = accountRepository.sumBalanceByType(AccountType.REVENUE);
        BigDecimal expenses = accountRepository.sumBalanceByType(AccountType.EXPENSE);

        Map<String, BigDecimal> breakdown = new LinkedHashMap<>();
        breakdown.put("ASSET", assets);
        breakdown.put("LIABILITY", liabilities);
        breakdown.put("EQUITY", equity);
        breakdown.put("REVENUE", revenue);
        breakdown.put("EXPENSE", expenses);

        long count = accountRepository.count();

        return new AccountSummaryDTO(assets, liabilities, equity, revenue, expenses, breakdown, count);
    }

    public AccountDTO mapToDTO(AccountEntity entity) {
        return new AccountDTO(
                entity.getId(),
                entity.getCode(),
                entity.getName(),
                entity.getType(),
                entity.getCurrency(),
                entity.getBalance(),
                entity.isActive(),
                entity.getParentAccount() != null ? entity.getParentAccount().getId() : null,
                entity.getType().isDebitNormal() ? "DEBIT" : "CREDIT",
                entity.getCreatedAt()
        );
    }
}
