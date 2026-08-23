package com.alxnrocha.vaultledger.repository;

import com.alxnrocha.vaultledger.entity.LedgerEntryEntity;
import com.alxnrocha.vaultledger.enums.EntryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntryEntity, UUID> {

    List<LedgerEntryEntity> findByTransactionId(UUID transactionId);

    List<LedgerEntryEntity> findByAccountIdOrderByCreatedAtDesc(UUID accountId);

    Page<LedgerEntryEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM LedgerEntryEntity e WHERE e.entryType = :type")
    BigDecimal sumTotalByEntryType(@Param("type") EntryType type);
}
