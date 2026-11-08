package com.uwcandfound.app.controller;

import com.uwcandfound.app.request.claims.ReviewClaimRequest;
import com.uwcandfound.app.request.claims.SubmitClaimRequest;
import com.uwcandfound.app.request.ClaimResponse;
import com.uwcandfound.app.services.Claims.IClaims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimsController {

    private final IClaims claimsService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClaimResponse submitClaim(@RequestBody SubmitClaimRequest request) {
        return claimsService.submitClaim(request.itemId(), request.explanation());
    }

    @GetMapping("/my")
    public List<ClaimResponse> getMyClaims() {
        return claimsService.getMyClaims();
    }

    @GetMapping("/{claimId}")
    public ClaimResponse getClaimById(@PathVariable Long claimId) {
        return claimsService.getClaimById(claimId);
    }

    @GetMapping
    public List<ClaimResponse> getAllClaims() {
        return claimsService.getAllClaims();
    }

    @PatchMapping("/{claimId}/review")
    public ClaimResponse reviewClaim(
            @PathVariable Long claimId,
            @RequestBody ReviewClaimRequest request
    ) {
        return claimsService.reviewClaim(
                claimId,
                request.decision(),
                request.adminNotes()
        );
    }
}
