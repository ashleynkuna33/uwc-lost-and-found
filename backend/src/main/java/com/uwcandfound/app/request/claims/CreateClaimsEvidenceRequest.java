
package com.uwcandfound.app.request.claims;

import com.uwcandfound.app.models.ClaimsEvidence.EvidenceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateClaimsEvidenceRequest(

        @NotNull(message = "Evidence type is required")
        EvidenceType evidenceType,

        @Size(max = 5000, message = "Description cannot exceed 5000 characters")
        String description

) {}

