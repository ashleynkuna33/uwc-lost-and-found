package com.uwcandfound.app.request.claims;

import com.uwcandfound.app.models.ClaimsEvidence;

// Only TEXT submissions are currently accepted by the service.
// IMAGE and DOCUMENT require an upload/storage API to be implemented first.
public record CreateClaimsEvidenceRequest(
        ClaimsEvidence.EvidenceType evidenceType,
        String description
) {}
