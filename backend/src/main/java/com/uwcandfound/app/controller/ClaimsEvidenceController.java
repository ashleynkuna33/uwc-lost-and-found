package com.uwcandfound.app.controller;

import com.uwcandfound.app.request.ClaimsEvidenceResponse;
import com.uwcandfound.app.request.claims.CreateClaimsEvidenceRequest;
import com.uwcandfound.app.services.Claims.IClaims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimsEvidenceController {

    private final IClaims claimsService;

    @PostMapping("/{claimId}/evidence")
    public ResponseEntity<ClaimsEvidenceResponse> submitEvidence(
            @PathVariable Long claimId,
            @RequestBody CreateClaimsEvidenceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(claimsService.submitEvidence(claimId, request));
    }

    @GetMapping("/{claimId}/evidence")
    public ResponseEntity<List<ClaimsEvidenceResponse>> getClaimEvidence(
            @PathVariable Long claimId
    ) {
        return ResponseEntity.ok(claimsService.getClaimEvidence(claimId));
    }
}
