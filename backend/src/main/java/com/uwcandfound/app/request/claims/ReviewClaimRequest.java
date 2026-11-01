package com.uwcandfound.app.request.claims;

import com.uwcandfound.app.models.Claims;

/* Carries the administrator's decision and notes from the frontend. */
public class ReviewClaimRequest {
    private Claims.ClaimStatus decision;
    private String adminNotes;

    public Claims.ClaimStatus getDecision() { return decision; }
    public void setDecision(Claims.ClaimStatus decision) { this.decision = decision; }
    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }
}

