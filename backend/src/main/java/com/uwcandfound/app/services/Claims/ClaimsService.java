package com.uwcandfound.app.services.Claims;

import com.uwcandfound.app.models.Claims;
import com.uwcandfound.app.models.ClaimsEvidence;
import com.uwcandfound.app.models.User;
import com.uwcandfound.app.repositories.ClaimRepository;
import com.uwcandfound.app.repositories.ClaimsEvidenceRepository;
import com.uwcandfound.app.repositories.UserRepository;
import com.uwcandfound.app.request.ClaimsEvidenceResponse;
import com.uwcandfound.app.request.claims.CreateClaimsEvidenceRequest;
import com.uwcandfound.app.request.ClaimResponse;
import com.uwcandfound.app.security.CurrentPrincipalService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClaimsService implements IClaims {

    private final ClaimRepository claimsRepository;
    private final ClaimsEvidenceRepository evidenceRepository;
    private final UserRepository userRepository;
    private final CurrentPrincipalService currentPrincipalService;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public ClaimResponse submitClaim(Long itemId, String explanation) {
        User student = currentUser();
        if (student.getRole() != User.Role.STUDENT) {
            throw error(HttpStatus.FORBIDDEN, "Only students can submit claims.");
        }
        if (explanation == null || explanation.isBlank()) {
            throw error(HttpStatus.BAD_REQUEST, "An ownership explanation is required.");
        }
        if (explanation.trim().length() > 10000) {
            throw error(HttpStatus.BAD_REQUEST, "The explanation is too long.");
        }

        // All claim submissions and reviews lock the item's database row first.
        Object[] item = lockItem(itemId);
        requireAvailableFoundItem(item);

        List<Claims> existing = claimsRepository.findByItemId(itemId);
        if (existing.stream().anyMatch(c ->
                student.getId().equals(c.getClaimantId())
                        && c.getStatus() == Claims.ClaimStatus.pending)) {
            throw error(HttpStatus.CONFLICT, "You already have a pending claim for this item.");
        }
        if (existing.stream().anyMatch(c -> c.getStatus() == Claims.ClaimStatus.approved)) {
            throw error(HttpStatus.CONFLICT, "An approved claim already exists for this item.");
        }

        Claims claim = new Claims();
        claim.setItemId(itemId);
        // Never take claimantId from the client: derive it from the JWT's user.
        claim.setClaimantId(student.getId());
        claim.setExplanation(explanation.trim());
        claim.setStatus(Claims.ClaimStatus.pending);

        return ClaimResponse.from(claimsRepository.save(claim), false);
    }

    @Override
    public List<ClaimResponse> getMyClaims() {
        Long userId = currentUser().getId();
        return claimsRepository.findByClaimantId(userId).stream()
                .map(c -> ClaimResponse.from(c, false))
                .toList();
    }

    @Override
    public ClaimResponse getClaimById(Long claimId) {
        User user = currentUser();
        Claims claim = findClaim(claimId);
        boolean admin = user.getRole() == User.Role.ADMIN;
        if (!admin && !user.getId().equals(claim.getClaimantId())) {
            throw error(HttpStatus.FORBIDDEN, "You cannot view another student's claim.");
        }
        return ClaimResponse.from(claim, admin);
    }

    @Override
    public List<ClaimResponse> getAllClaims() {
        requireAdministrator();
        return claimsRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(c -> ClaimResponse.from(c, true))
                .toList();
    }

    @Override
    @Transactional
    public ClaimResponse reviewClaim(
            Long claimId,
            Claims.ClaimStatus decision,
            String adminNotes
    ) {
        User administrator = requireAdministrator();
        requirePositiveId(claimId);

        if (decision != Claims.ClaimStatus.approved
                && decision != Claims.ClaimStatus.rejected) {
            throw error(HttpStatus.BAD_REQUEST, "Choose approved or rejected.");
        }
        if (decision == Claims.ClaimStatus.rejected
                && (adminNotes == null || adminNotes.isBlank())) {
            throw error(HttpStatus.BAD_REQUEST, "Please provide a rejection reason.");
        }

        // Lock item before loading the claim, matching submitClaim's lock order.
        List<?> ids = entityManager.createNativeQuery(
                        "SELECT item_id FROM claims WHERE claim_id = :id")
                .setParameter("id", claimId)
                .getResultList();
        if (ids.isEmpty()) {
            throw error(HttpStatus.NOT_FOUND, "Claim not found.");
        }
        Long itemId = ((Number) ids.get(0)).longValue();
        Object[] item = lockItem(itemId);
        // Serialize review against concurrent evidence submission on the claim.
        Claims claim = claimsRepository.findByIdForUpdate(claimId)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Claim not found."));

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
            if (otherClaims.stream().anyMatch(
                    c -> c.getStatus() == Claims.ClaimStatus.approved)) {
                throw error(HttpStatus.CONFLICT, "Another claim is already approved.");
            }

            // The items table now stores uppercase OPEN/CLAIMED enum names.
            entityManager.createNativeQuery(
                            "UPDATE items SET status = 'CLAIMED' WHERE item_id = :id")
                    .setParameter("id", itemId)
                    .executeUpdate();

            // Reject other pending claims in the same database transaction.
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

        return ClaimResponse.from(claimsRepository.save(claim), true);
    }

    @Override
    @Transactional
    public ClaimsEvidenceResponse submitEvidence(
            Long claimId,
            CreateClaimsEvidenceRequest request
    ) {
        User student = currentUser();
        if (student.getRole() != User.Role.STUDENT) {
            throw error(HttpStatus.FORBIDDEN, "Only students can submit evidence.");
        }
        if (request == null || request.evidenceType() == null) {
            throw error(HttpStatus.BAD_REQUEST, "Evidence type is required.");
        }

        requirePositiveId(claimId);
        // Lock claim row so evidence cannot be added concurrently with a review.
        Claims claim = claimsRepository.findByIdForUpdate(claimId)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Claim not found."));

        if (!student.getId().equals(claim.getClaimantId())) {
            throw error(HttpStatus.FORBIDDEN, "You can only submit evidence for your own claim.");
        }
        if (claim.getStatus() != Claims.ClaimStatus.pending) {
            throw error(HttpStatus.CONFLICT, "Evidence can only be submitted for pending claims.");
        }

        if (request.evidenceType() != ClaimsEvidence.EvidenceType.TEXT) {
            throw error(HttpStatus.BAD_REQUEST,
                    "IMAGE and DOCUMENT submissions require a secure file-upload endpoint.");
        }
        if (request.description() == null || request.description().isBlank()) {
            throw error(HttpStatus.BAD_REQUEST, "A description is required for text evidence.");
        }

        ClaimsEvidence evidence = new ClaimsEvidence();
        evidence.setClaim(claim);
        evidence.setDescription(request.description().trim());
        evidence.setEvidenceType(ClaimsEvidence.EvidenceType.TEXT);
        evidence.setFilePath(null);

        return toEvidenceResponse(evidenceRepository.save(evidence));
    }

    @Override
    public List<ClaimsEvidenceResponse> getClaimEvidence(Long claimId) {
        // Enforce claimant/admin authorization before exposing evidence.
        getClaimById(claimId);
        return evidenceRepository.findByClaimClaimId(claimId).stream()
                .map(this::toEvidenceResponse)
                .toList();
    }

    private ClaimsEvidenceResponse toEvidenceResponse(ClaimsEvidence evidence) {
        return new ClaimsEvidenceResponse(
                evidence.getEvidenceId(),
                evidence.getClaim().getClaimId(),
                evidence.getDescription(),
                evidence.getEvidenceType(),
                evidence.getFilePath(),
                evidence.getSubmittedAt()
        );
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
                .setParameter("id", itemId)
                .getResultList();
        if (rows.isEmpty()) {
            throw error(HttpStatus.NOT_FOUND, "Item not found.");
        }
        return (Object[]) rows.get(0);
    }

    private void requireAvailableFoundItem(Object[] item) {
        if (item[0] == null || !"FOUND".equalsIgnoreCase(item[0].toString())) {
            throw error(HttpStatus.BAD_REQUEST, "Claims can only be submitted for found items.");
        }
        if (item[1] == null || !"OPEN".equalsIgnoreCase(item[1].toString())) {
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
}
