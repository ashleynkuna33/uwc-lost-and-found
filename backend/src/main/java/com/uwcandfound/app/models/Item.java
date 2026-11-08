package com.uwcandfound.app.models;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;
import org.jspecify.annotations.NonNull;

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
    private Long id;

    @Column(name = "reported_by", nullable = false)
    private String studentNumber;

    public enum Type {
        LOST,
        FOUND
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private Type type = Type.FOUND;

    // Name of the lost or found item
    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;

    // Description of the item
    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "location_details", length = 255)
    private String locationDetails;

    public enum Status {
        OPEN,
        CLAIMED,
        RETURNED,
        CLOSED
    }
    // Current status of the item
    @Column(name = "status", nullable = false, length = 50)
    private Status status = Status.OPEN;

    // Date when the item was lost or found
    @Column(name = "date_occurred")
    private LocalDateTime dateOccurred;

    // Automatically records when the item is created
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "")
    @JoinColumn(name = "item_id")
    private Set<ItemImage> itemImages;
}