package com.uwcandfound.app.controller;

import com.uwcandfound.app.services.Claims.IClaims;
import com.uwcandfound.app.request.claims.CreateClaimsEvidenceRequest;
import com.uwcandfound.app.request.ClaimsEvidenceResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimsEvidenceController {

    private final IClaims claimsService;

    // Submit evidence for a claim
    @PostMapping("/{claimId}/evidence")
    public ResponseEntity<ClaimsEvidenceResponse> submitEvidence(
            @PathVariable Long claimId,
            @RequestBody CreateClaimsEvidenceRequest request) {

        ClaimsEvidenceResponse response =
                claimsService.submitEvidence(claimId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Retrieve evidence for a claim
    @GetMapping("/{claimId}/evidence")
    public ResponseEntity<List<ClaimsEvidenceResponse>> getClaimEvidence(
            @PathVariable Long claimId) {

        List<ClaimsEvidenceResponse> evidence =
                claimsService.getClaimEvidence(claimId);

        return ResponseEntity.ok(evidence);
    }
}