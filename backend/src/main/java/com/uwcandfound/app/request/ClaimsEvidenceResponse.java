
package com.uwcandfound.app.request;

import com.uwcandfound.app.models.ClaimsEvidence.EvidenceType;

import java.time.LocalDateTime;

public record ClaimsEvidenceResponse(

        Long evidenceId,
        Long claimId,
        String description,
        EvidenceType evidenceType,
        String filePath,
        LocalDateTime submittedAt

) {}
