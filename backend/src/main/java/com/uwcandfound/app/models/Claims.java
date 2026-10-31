package com.uwcandfound.app.models;

import jakarta.persistence.*;
import lombok.*;
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

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "claimant_id", nullable = false)
    private Long claimantId;

    @Column(name = "explanation", nullable = false, columnDefinition = "TEXT")
    private String explanation;

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

/*
 * This entity represents a student's claim for a found item
 * in the UWC Lost and Found application.
 *
 * Each Claims object represents one row in the claims table.
 *
 * It stores:
 * - The ID of the item being claimed.
 * - The ID of the student submitting the claim.
 * - The student's explanation of ownership.
 * - The claim status: pending, approved or rejected.
 * - The reviewing administrator's ID, notes and review time.
 * - The time the claim was created.
 *
 * The annotations map the Java fields to database columns.
 * The item and user links are currently stored as IDs.
 *
 * This entity only describes the claim data.
 * The service handles the rules for submitting and reviewing claims.
 * The repository saves and retrieves claims from the database.
 */
