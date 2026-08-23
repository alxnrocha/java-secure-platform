package com.alxnrocha.vaultledger.repository;

import com.alxnrocha.vaultledger.entity.AccountEntity;
import com.alxnrocha.vaultledger.enums.AccountType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<AccountEntity, UUID> {

    Optional<AccountEntity> findByCode(String code);

    boolean existsByCode(String code);

    List<AccountEntity> findByType(AccountType type);

    List<AccountEntity> findByActiveTrue();

    List<AccountEntity> findByActiveTrueOrderByCodeAsc();

    /**
     * Pessimistic lock for atomic transfer execution to prevent race conditions.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AccountEntity a WHERE a.id = :id")
    Optional<AccountEntity> findByIdWithLock(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AccountEntity a WHERE a.code = :code")
    Optional<AccountEntity> findByCodeWithLock(@Param("code") String code);

    @Query("SELECT COALESCE(SUM(a.balance), 0) FROM AccountEntity a WHERE a.type = :type AND a.active = true")
    BigDecimal sumBalanceByType(@Param("type") AccountType type);
}
