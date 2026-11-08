package com.uwcandfound.app.repositories;

import com.uwcandfound.app.models.Claims;
import com.uwcandfound.app.models.ClaimsEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClaimsEvidenceRepository extends JpaRepository<ClaimsEvidence, Long> {

    List<ClaimsEvidence> findByClaim(Claims claim);

    List<ClaimsEvidence> findByEvidenceType(ClaimsEvidence.EvidenceType evidenceType);

    @Query("""
           SELECT e
           FROM ClaimsEvidence e
           WHERE e.claim.claimId = :claimId
           ORDER BY e.submittedAt ASC, e.evidenceId ASC
           """)
    List<ClaimsEvidence> findByClaimClaimId(@Param("claimId") Long claimId);
}
