package com.uwcandfound.app.services.Claims;
import com.uwcandfound.app.models.ClaimsEvidence;
import com.uwcandfound.app.request.claims.CreateClaimsEvidenceRequest;
import com.uwcandfound.app.request.ClaimsEvidenceResponse;

import com.uwcandfound.app.models.Claims;
import java.util.List;


/* Lists the operations provided by the claims service. */
public interface IClaims {
    Claims submitClaim(Long itemId, String explanation);
    List<Claims> getMyClaims();
    Claims getClaimById(Long claimId);
    List<Claims> getAllClaims();
    Claims reviewClaim(Long claimId, Claims.ClaimStatus decision, String adminNotes);

    ClaimsEvidenceResponse submitEvidence(
        Long claimId,
        CreateClaimsEvidenceRequest request
);

List<ClaimsEvidenceResponse> getClaimEvidence(Long claimId);
}
