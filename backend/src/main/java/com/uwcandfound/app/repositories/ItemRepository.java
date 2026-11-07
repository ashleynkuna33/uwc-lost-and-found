package com.uwcandfound.app.repositories;

import com.uwcandfound.app.models.Items;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Items, Long> {

    // Search items by status (e.g., "LOST", "FOUND", "CLAIMED")
    List<Items> findByStatus(String status);

    // Search items by name (case-insensitive search)
    List<Items> findByItemNameContainingIgnoreCase(String itemName);

    // Search items containing keywords in name or description
    List<Items> findByItemNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String itemName, String description);
}