package com.alxnrocha.vaultledger.dto;

import com.alxnrocha.vaultledger.enums.AccountType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Schema(description = "Hierarchical Chart of Accounts tree structure")
public record AccountHierarchyDTO(
        UUID id,
        String code,
        String name,
        AccountType type,
        String currency,
        BigDecimal balance,
        boolean active,
        List<AccountHierarchyDTO> subAccounts
) {}
