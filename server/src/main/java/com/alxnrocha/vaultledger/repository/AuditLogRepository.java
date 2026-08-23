package com.alxnrocha.vaultledger.repository;

import com.alxnrocha.vaultledger.entity.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {

    Optional<AuditLogEntity> findTopByOrderByCreatedAtDesc();

    List<AuditLogEntity> findByEntityNameAndEntityIdOrderByCreatedAtDesc(String entityName, String entityId);

    List<AuditLogEntity> findTop50ByOrderByCreatedAtDesc();

    Page<AuditLogEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Optional<AuditLogEntity> findByCurrentHash(String currentHash);

    @Query("SELECT COUNT(a) FROM AuditLogEntity a")
    long countTotalLogs();
}
