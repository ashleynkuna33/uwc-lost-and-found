package com.uwcandfound.app.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;

import lombok.*;



@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
public class Reports {

    
    public enum ReportType {
        lost,
        found
    }

    public enum ReportStatus {
        open,
        claimed,
        returned,
        closed
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long id;

    // Set from the logged-in user in the service, never from the request body.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false)
    private ReportType reportType;

    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Categories category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Locations location;

    @Column(name = "location_details", length = 255)
    private String locationDetails;

    @Column(name = "date_occurred", nullable = false)
    private LocalDate dateOccurred;

    // Default lives here; only the service should change it afterwards.
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReportStatus status = ReportStatus.open;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Not a column: this is the "one report has many photos" side of the
    // relationship. The foreign key lives in report_images.report_id.
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("uploadedAt ASC")
    private List<ItemImage> images = new ArrayList<>();
}