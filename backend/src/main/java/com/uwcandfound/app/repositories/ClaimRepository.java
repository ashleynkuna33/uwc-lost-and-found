package com.uwcandfound.app.repositories;

import com.uwcandfound.app.models.Claims;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claims, Long> {

    List<Claims> findByClaimantId(Long claimantId);

    List<Claims> findByItemId(Long itemId);

    List<Claims> findByStatus(Claims.ClaimStatus status);

    List<Claims> findAllByOrderByCreatedAtDesc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Claims c WHERE c.claimId = :claimId")
    Optional<Claims> findByIdForUpdate(@Param("claimId") Long claimId);
}
