package com.uwcandfound.app.controller;

import com.uwcandfound.app.models.Claims;
import com.uwcandfound.app.request.claims.SubmitClaimRequest;
import com.uwcandfound.app.request.claims.ReviewClaimRequest;
import com.uwcandfound.app.services.Claims.IClaims;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/* Receives claims HTTP requests and passes the work to the claims service.
 * The service checks the logged-in user, permissions and claim rules.
 */
@RestController
@RequestMapping("/api/claims")
public class ClaimsController {
    private final IClaims claimsService;

    // Spring supplies the service through this constructor.
    public ClaimsController(IClaims claimsService) {
        this.claimsService = claimsService;
    }

    // A student submits a claim for a found item.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Claims submitClaim(@RequestBody SubmitClaimRequest request) {
        return claimsService.submitClaim(request.getItemId(), request.getExplanation());
    }

    // Returns only the logged-in user's claims.
    @GetMapping("/my")
    public List<Claims> getMyClaims() {
        return claimsService.getMyClaims();
    }

    // The service allows the claim owner or an administrator to view it.
    @GetMapping("/{claimId}")
    public Claims getClaimById(@PathVariable("claimId") Long claimId) {
        return claimsService.getClaimById(claimId);
    }

    // The service allows only administrators to view every claim.
    @GetMapping
    public List<Claims> getAllClaims() {
        return claimsService.getAllClaims();
    }

    // An administrator approves or rejects a pending claim.
    @PatchMapping("/{claimId}/review")
    public Claims reviewClaim(@PathVariable("claimId") Long claimId,
                              @RequestBody ReviewClaimRequest request) {
        return claimsService.reviewClaim(claimId, request.getDecision(), request.getAdminNotes());
    }
}
