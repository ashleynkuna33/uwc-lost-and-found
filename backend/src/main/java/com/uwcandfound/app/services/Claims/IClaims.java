package com.uwcandfound.app.services.Claims;

import com.uwcandfound.app.models.Claims;
import com.uwcandfound.app.request.ClaimsEvidenceResponse;
import com.uwcandfound.app.request.claims.CreateClaimsEvidenceRequest;
import com.uwcandfound.app.request.ClaimResponse;

import java.util.List;

public interface IClaims {

    ClaimResponse submitClaim(Long itemId, String explanation);

    List<ClaimResponse> getMyClaims();

    ClaimResponse getClaimById(Long claimId);

    List<ClaimResponse> getAllClaims();

    ClaimResponse reviewClaim(
            Long claimId,
            Claims.ClaimStatus decision,
            String adminNotes
    );

    ClaimsEvidenceResponse submitEvidence(
            Long claimId,
            CreateClaimsEvidenceRequest request
    );

    List<ClaimsEvidenceResponse> getClaimEvidence(Long claimId);
}
