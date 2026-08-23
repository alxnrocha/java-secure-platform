package com.alxnrocha.vaultledger.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "entity_name", nullable = false, length = 50)
    private String entityName;

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "payload_before", columnDefinition = "jsonb")
    private String payloadBefore;

    @Column(name = "payload_after", columnDefinition = "jsonb")
    private String payloadAfter;

    @Column(name = "previous_hash", nullable = false, length = 64)
    private String previousHash;

    @Column(name = "current_hash", nullable = false, unique = true, length = 64)
    private String currentHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AuditLogEntity() {}

    public AuditLogEntity(String action, String entityName, String entityId, UserEntity user, String userEmail, String ipAddress, String payloadBefore, String payloadAfter, String previousHash, String currentHash) {
        this.action = action;
        this.entityName = entityName;
        this.entityId = entityId;
        this.user = user;
        this.userEmail = (userEmail != null) ? userEmail : "system@vaultledger.internal";
        this.ipAddress = ipAddress;
        this.payloadBefore = payloadBefore;
        this.payloadAfter = payloadAfter;
        this.previousHash = previousHash;
        this.currentHash = currentHash;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }

    public UserEntity getUser() { return user; }
    public void setUser(UserEntity user) { this.user = user; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getPayloadBefore() { return payloadBefore; }
    public void setPayloadBefore(String payloadBefore) { this.payloadBefore = payloadBefore; }

    public String getPayloadAfter() { return payloadAfter; }
    public void setPayloadAfter(String payloadAfter) { this.payloadAfter = payloadAfter; }

    public String getPreviousHash() { return previousHash; }
    public void setPreviousHash(String previousHash) { this.previousHash = previousHash; }

    public String getCurrentHash() { return currentHash; }
    public void setCurrentHash(String currentHash) { this.currentHash = currentHash; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AuditLogEntity that)) return false;
        return Objects.equals(id, that.id) || (currentHash != null && currentHash.equals(that.currentHash));
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, currentHash);
    }
}
