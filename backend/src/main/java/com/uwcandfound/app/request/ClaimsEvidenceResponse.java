package com.uwcandfound.app.request;

import com.uwcandfound.app.models.ClaimsEvidence;
import java.time.LocalDateTime;


public record ClaimsEvidenceResponse(
        Long evidenceId,
        Long claimId,
        String description,
        ClaimsEvidence.EvidenceType evidenceType,
        String filePath,
        LocalDateTime submittedAt
) {}
