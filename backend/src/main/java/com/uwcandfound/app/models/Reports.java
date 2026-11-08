package com.uwcandfound.app.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.*;

// A report links a user to an item. The item holds everything about the object
// (type, status, name, photos...). The report holds who reported it and,
// when it was closed, who closed it and why. Item itself is not changed.
@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
public class Reports {

    // Used by the request/response classes. The service converts these to
    // Item.Type and Item.Status (same names) when it talks to the item.
    public enum ReportType {
        LOST,
        FOUND
    }

    public enum ReportStatus {
        OPEN,
        CLAIMED,
        RETURNED,
        CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long id;

    // Set from the logged-in user in the service, never from the request body.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false, unique = true)
    private Item item;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Filled in when the item is closed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by")
    private User closedBy;

    @Column(name = "closed_reason", length = 500)
    private String closedReason;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;
}