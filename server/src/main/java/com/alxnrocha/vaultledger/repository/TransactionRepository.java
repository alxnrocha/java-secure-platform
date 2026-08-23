package com.alxnrocha.vaultledger.repository;

import com.alxnrocha.vaultledger.entity.TransactionEntity;
import com.alxnrocha.vaultledger.enums.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, UUID> {

    Optional<TransactionEntity> findByReferenceNumber(String referenceNumber);

    boolean existsByReferenceNumber(String referenceNumber);

    List<TransactionEntity> findByStatus(TransactionStatus status);

    List<TransactionEntity> findTop20ByOrderByPostedAtDesc();

    Page<TransactionEntity> findAllByOrderByPostedAtDesc(Pageable pageable);

    @Query("SELECT t FROM TransactionEntity t WHERE t.postedAt BETWEEN :startDate AND :endDate ORDER BY t.postedAt DESC")
    List<TransactionEntity> findByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
}
