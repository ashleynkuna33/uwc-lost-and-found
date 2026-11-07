package com.uwcandfound.app.services.Claims;

import com.uwcandfound.app.models.Claims;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.ClaimRepository;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.security.CurrentPrincipalService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/*Claims Evidence */
import com.uwcandfound.app.models.ClaimsEvidence;
import com.uwcandfound.app.repositories.ClaimsEvidenceRepository;
import com.uwcandfound.app.request.claims.CreateClaimsEvidenceRequest;
import com.uwcandfound.app.request.ClaimsEvidenceResponse;


import java.time.LocalDateTime;
import java.util.List;

/*
 * Handles the rules for submitting, viewing and reviewing claims.
 * Uses repositories to access claims and users.
 * Uses the existing items table while the team's Items entity is unfinished.
 * The controller must call this Spring-managed service to apply transactions.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClaimsService implements IClaims {

    private final ClaimRepository claimsRepository;
    private final UserRepository userRepository;
    private final CurrentPrincipalService currentPrincipalService;
    private final EntityManager entityManager;

    /*Claims Evidence */
    private final ClaimsEvidenceRepository evidenceRepository;


    @Override
    @Transactional
    public Claims submitClaim(Long itemId, String explanation) {
        User student = currentUser();
        if (student.getRole() != User.Role.STUDENT) {
            throw error(HttpStatus.FORBIDDEN, "Only students can submit claims.");
        }
        if (explanation == null || explanation.isBlank()) {
            throw error(HttpStatus.BAD_REQUEST, "An ownership explanation is required.");
        }

        // All submissions and reviews lock the item first to prevent conflicting changes.
        Object[] item = lockItem(itemId);
        requireAvailableFoundItem(item);
        List<Claims> existing = claimsRepository.findByItemId(itemId);
        boolean duplicate = existing.stream().anyMatch(claim ->
                student.getId().equals(claim.getClaimantId())
                && claim.getStatus() == Claims.ClaimStatus.pending);
        if (duplicate) {
            throw error(HttpStatus.CONFLICT, "You already have a pending claim for this item.");
        }
        if (existing.stream().anyMatch(c -> c.getStatus() == Claims.ClaimStatus.approved)) {
            throw error(HttpStatus.CONFLICT, "An approved claim already exists for this item.");
        }

        Claims claim = new Claims();
        claim.setItemId(itemId);
        // Identity comes from the validated login, never from a submitted claimant ID.
        claim.setClaimantId(student.getId());
        claim.setExplanation(explanation.trim());
        claim.setStatus(Claims.ClaimStatus.pending);
        return claimsRepository.save(claim);
    }

    @Override
    public List<Claims> getMyClaims() {
        return claimsRepository.findByClaimantId(currentUser().getId());
    }

    @Override
    public Claims getClaimById(Long claimId) {
        User user = currentUser();
        Claims claim = findClaim(claimId);
        if (user.getRole() != User.Role.ADMIN
                && !user.getId().equals(claim.getClaimantId())) {
            throw error(HttpStatus.FORBIDDEN, "You cannot view another student's claim.");
        }
        return claim;
    }

    @Override
    public List<Claims> getAllClaims() {
        requireAdministrator();
        return claimsRepository.findAll();
    }

    @Override
    @Transactional
    public Claims reviewClaim(Long claimId, Claims.ClaimStatus decision, String adminNotes) {
        User administrator = requireAdministrator();
        requirePositiveId(claimId);
        if (decision != Claims.ClaimStatus.approved && decision != Claims.ClaimStatus.rejected) {
            throw error(HttpStatus.BAD_REQUEST, "Choose approved or rejected.");
        }
        if (decision == Claims.ClaimStatus.rejected
                && (adminNotes == null || adminNotes.isBlank())) {
            throw error(HttpStatus.BAD_REQUEST, "Please provide a rejection reason.");
        }

        // Read only the item ID first; load the claim after acquiring the item lock.
        List<?> ids = entityManager.createNativeQuery(
                "SELECT item_id FROM claims WHERE claim_id = :id")
                .setParameter("id", claimId).getResultList();
        if (ids.isEmpty()) {
            throw error(HttpStatus.NOT_FOUND, "Claim not found.");
        }
        Long itemId = ((Number) ids.get(0)).longValue();
        Object[] item = lockItem(itemId);
        Claims claim = findClaim(claimId);
        if (claim.getStatus() != Claims.ClaimStatus.pending) {
            throw error(HttpStatus.CONFLICT, "This claim has already been reviewed.");
        }
        if (administrator.getId().equals(claim.getClaimantId())) {
            throw error(HttpStatus.FORBIDDEN, "You cannot review your own claim.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (decision == Claims.ClaimStatus.approved) {
            requireAvailableFoundItem(item);
            List<Claims> otherClaims = claimsRepository.findByItemId(itemId);
            if (otherClaims.stream().anyMatch(c -> c.getStatus() == Claims.ClaimStatus.approved)) {
                throw error(HttpStatus.CONFLICT, "Another claim is already approved.");
            }
            entityManager.createNativeQuery(
                    "UPDATE items SET status = 'claimed' WHERE item_id = :id")
                    .setParameter("id", itemId).executeUpdate();

            // Reject competing pending claims in the same transaction.
            for (Claims other : otherClaims) {
                if (!other.getClaimId().equals(claimId)
                        && other.getStatus() == Claims.ClaimStatus.pending) {
                    other.setStatus(Claims.ClaimStatus.rejected);
                    other.setReviewedBy(administrator.getId());
                    other.setReviewedAt(now);
                    other.setAdminNotes("Another claim was approved for this item.");
                    claimsRepository.save(other);
                }
            }
        }
        claim.setStatus(decision);
        claim.setReviewedBy(administrator.getId());
        claim.setReviewedAt(now);
        claim.setAdminNotes(adminNotes == null ? null : adminNotes.trim());
        return claimsRepository.save(claim);
    }

    private User currentUser() {
        String email;
        try {
            email = currentPrincipalService.getCurrentUserEmail();
        } catch (IllegalStateException exception) {
            throw error(HttpStatus.UNAUTHORIZED, "Please log in.");
        }
        if (email == null || email.isBlank()) {
            throw error(HttpStatus.UNAUTHORIZED, "The login token has no email claim.");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> error(HttpStatus.UNAUTHORIZED, "User account not found."));
        if (!user.isActive()) {
            throw error(HttpStatus.FORBIDDEN, "Your account is inactive.");
        }
        return user;
    }

    private User requireAdministrator() {
        User user = currentUser();
        if (user.getRole() != User.Role.ADMIN) {
            throw error(HttpStatus.FORBIDDEN, "Only administrators can perform this action.");
        }
        return user;
    }

    private Claims findClaim(Long claimId) {
        requirePositiveId(claimId);
        return claimsRepository.findById(claimId)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Claim not found."));
    }

    private Object[] lockItem(Long itemId) {
        requirePositiveId(itemId);
        List<?> rows = entityManager.createNativeQuery(
                "SELECT report_type, status FROM items WHERE item_id = :id FOR UPDATE")
                .setParameter("id", itemId).getResultList();
        if (rows.isEmpty()) {
            throw error(HttpStatus.NOT_FOUND, "Item not found.");
        }
        return (Object[]) rows.get(0);
    }

    private void requireAvailableFoundItem(Object[] item) {
        if (!"found".equals(item[0].toString())) {
            throw error(HttpStatus.BAD_REQUEST, "Claims can only be submitted for found items.");
        }
        if (!"open".equals(item[1].toString())) {
            throw error(HttpStatus.CONFLICT, "This item is no longer available to claim.");
        }
    }

    private void requirePositiveId(Long id) {
        if (id == null || id <= 0) {
            throw error(HttpStatus.BAD_REQUEST, "A valid positive ID is required.");
        }
    }

    private ResponseStatusException error(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }


    /*Claims Evidence Sevice */
    
@Override
@Transactional
public ClaimsEvidenceResponse submitEvidence(
        Long claimId,
        CreateClaimsEvidenceRequest request) {

    User student = currentUser();

    // Only the claimant can submit evidence.
    Claims claim = findClaim(claimId);

    if (!student.getId().equals(claim.getClaimantId())) {
        throw error(HttpStatus.FORBIDDEN,
                "You can only submit evidence for your own claim.");
    }

    // Evidence cannot be changed after the claim has been reviewed.
    if (claim.getStatus() != Claims.ClaimStatus.pending) {
        throw error(HttpStatus.CONFLICT,
                "Evidence can only be submitted for pending claims.");
    }

    if (request.evidenceType() == null) {
        throw error(HttpStatus.BAD_REQUEST,
                "Evidence type is required.");
    }

    // Text evidence is supported by this method initially.
    if (request.evidenceType() != ClaimsEvidence.EvidenceType.TEXT) {
        throw error(HttpStatus.BAD_REQUEST,
                "Image and document uploads require file storage integration.");
    }

    if (request.description() == null
            || request.description().isBlank()) {
        throw error(HttpStatus.BAD_REQUEST,
                "A description is required for text evidence.");
    }

    ClaimsEvidence evidence = new ClaimsEvidence();
    evidence.setClaim(claim);
    evidence.setDescription(request.description().trim());
    evidence.setEvidenceType(ClaimsEvidence.EvidenceType.TEXT);

    ClaimsEvidence saved = evidenceRepository.save(evidence);

    return toEvidenceResponse(saved);
}

@Override
public List<ClaimsEvidenceResponse> getClaimEvidence(Long claimId) {

    // Reuses your existing authorization rules:
    // The claimant or an administrator can view the claim.
    Claims claim = getClaimById(claimId);

    return evidenceRepository.findByClaimClaimId(claim.getClaimId())
            .stream()
            .map(this::toEvidenceResponse)
            .toList();
}

private ClaimsEvidenceResponse toEvidenceResponse(
        ClaimsEvidence evidence) {

    return new ClaimsEvidenceResponse(
            evidence.getEvidenceId(),
            evidence.getClaim().getClaimId(),
            evidence.getDescription(),
            evidence.getEvidenceType(),
            evidence.getFilePath(),
            evidence.getSubmittedAt()
    );
}

}
