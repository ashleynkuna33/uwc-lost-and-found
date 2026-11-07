package com.uwcandfound.app.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Items {

    // Unique identifier for each item
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    // Name of the lost or found item
    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;

    // Description of the item
    @Column(name = "description", length = 1000)
    private String description;

    // Physical condition of the item
    @Column(name = "item_condition", length = 100)
    private String itemCondition;

    // Current status of the item
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    // Date when the item was lost or found
    @Column(name = "date_lost_or_found")
    private LocalDateTime dateLostOrFound;

    // Automatically records when the item is created
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Automatically records when the item is updated
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}