package com.uwcandfound.app.repositories;

import com.uwcandfound.app.models.Claims;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimsRepository extends JpaRepository<Claims, Long> {

    List<Claims> findByClaimantId(Long claimantId);

    List<Claims> findByItemId(Long itemId);

    List<Claims> findByStatus(Claims.ClaimStatus status);
}
/*
 * This repository saves and retrieves claims from the database.
 *
 * It allows us to:
 * - Save new claims and update existing claims.
 * - Find a claim using its ID.
 * - Retrieve a student's claims.
 * - Retrieve claims for a particular item.
 * - Find claims by status: pending, approved or rejected.
 *
 * The service uses this repository to access claim records.
 * The repository does not decide whether a claim should be approved.
 */