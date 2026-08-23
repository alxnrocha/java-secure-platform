package com.alxnrocha.vaultledger.entity;

import com.alxnrocha.vaultledger.enums.TransactionStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "transactions")
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reference_number", nullable = false, unique = true, length = 50)
    private String referenceNumber;

    @Column(nullable = false, length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status = TransactionStatus.POSTED;

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount;

    @Column(nullable = false, length = 3)
    private String currency = "EUR";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reversal_of_id")
    private TransactionEntity reversalOf;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private UserEntity createdByUser;

    @Column(name = "posted_at", nullable = false)
    private Instant postedAt = Instant.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LedgerEntryEntity> ledgerEntries = new ArrayList<>();

    public TransactionEntity() {}

    public TransactionEntity(String referenceNumber, String description, BigDecimal totalAmount, String currency, UserEntity createdByUser) {
        this.referenceNumber = referenceNumber;
        this.description = description;
        this.totalAmount = (totalAmount != null) ? totalAmount.setScale(4) : BigDecimal.ZERO.setScale(4);
        this.currency = (currency != null) ? currency : "EUR";
        this.createdByUser = createdByUser;
        this.status = TransactionStatus.POSTED;
        this.postedAt = Instant.now();
        this.createdAt = Instant.now();
    }

    public void addEntry(LedgerEntryEntity entry) {
        ledgerEntries.add(entry);
        entry.setTransaction(this);
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = (totalAmount != null) ? totalAmount.setScale(4) : BigDecimal.ZERO.setScale(4); }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public TransactionEntity getReversalOf() { return reversalOf; }
    public void setReversalOf(TransactionEntity reversalOf) { this.reversalOf = reversalOf; }

    public UserEntity getCreatedByUser() { return createdByUser; }
    public void setCreatedByUser(UserEntity createdByUser) { this.createdByUser = createdByUser; }

    public Instant getPostedAt() { return postedAt; }
    public void setPostedAt(Instant postedAt) { this.postedAt = postedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<LedgerEntryEntity> getLedgerEntries() { return ledgerEntries; }
    public void setLedgerEntries(List<LedgerEntryEntity> ledgerEntries) { this.ledgerEntries = ledgerEntries; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TransactionEntity that)) return false;
        return Objects.equals(id, that.id) || (referenceNumber != null && referenceNumber.equals(that.referenceNumber));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, referenceNumber);
    }
}
