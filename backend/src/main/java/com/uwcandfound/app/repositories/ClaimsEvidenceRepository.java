
package com.uwcandfound.app.repositories;

import com.uwcandfound.app.models.Claims;
import com.uwcandfound.app.models.ClaimsEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository 
public interface ClaimsEvidenceRepository
        extends JpaRepository<ClaimsEvidence, Long> {

    // Retrieve all evidence belonging to a particular claim.
    List<ClaimsEvidence> findByClaim(Claims claim);

    // Retrieve evidence using the claim ID.
    List<ClaimsEvidence> findByClaimClaimId(Long claimId);

    // Retrieve evidence by type.
    List<ClaimsEvidence> findByEvidenceType(
            ClaimsEvidence.EvidenceType evidenceType);
}
