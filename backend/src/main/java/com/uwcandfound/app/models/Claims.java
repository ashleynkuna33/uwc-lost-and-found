package com.uwcandfound.app.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Getter
@Setter
@NoArgsConstructor
public class Claims {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "claim_id")
    private Long claimId;

    // Existing schema stores foreign keys as IDs.
    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "claimant_id", nullable = false)
    private Long claimantId;

    @Column(name = "explanation", nullable = false, columnDefinition = "TEXT")
    private String explanation;

    // Keep lowercase: these are the enum names in the existing claims schema.
    public enum ClaimStatus {
        pending,
        approved,
        rejected
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ClaimStatus status = ClaimStatus.pending;

    @Column(name = "reviewed_by")
    private Long reviewedBy;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
