package com.uwcandfound.app.request.claims;

import com.uwcandfound.app.models.Claims;

public record ReviewClaimRequest(
        Claims.ClaimStatus decision,
        String adminNotes
) {}
