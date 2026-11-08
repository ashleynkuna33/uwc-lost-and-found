package com.uwcandfound.app.request;

import com.uwcandfound.app.models.Claims;
import java.time.LocalDateTime;

// Simple values only: no lazy-loading or recursive JPA serialization.
public record ClaimResponse(
        Long claimId,
        Long itemId,
        Long claimantId,
        String explanation,
        Claims.ClaimStatus status,
        Long reviewedBy,
        String adminNotes,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
    public static ClaimResponse from(Claims claim, boolean includeInternalNotes) {
        return new ClaimResponse(
                claim.getClaimId(),
                claim.getItemId(),
                claim.getClaimantId(),
                claim.getExplanation(),
                claim.getStatus(),
                includeInternalNotes ? claim.getReviewedBy() : null,
                includeInternalNotes ? claim.getAdminNotes() : null,
                claim.getCreatedAt(),
                claim.getReviewedAt()
        );
    }
}
