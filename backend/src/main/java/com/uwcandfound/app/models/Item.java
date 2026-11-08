
package com.uwcandfound.app.models;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import com.uwcandfound.app.models.Reports.ReportStatus;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Item {

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

    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private Status status = Status.OPEN;

    @Column(name = "date_occurred")
    private LocalDateTime dateOccurred;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ItemImage> itemImages = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Categories category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "location_id", nullable = false)
    private Locations location;

    // Add image to item
    public void addImage(ItemImage image) {
        itemImages.add(image);
        image.setItem(this);
    }

    // Remove image from item
    public void removeImage(ItemImage image) {
        itemImages.remove(image);
        image.setItem(null);
    }

    public void setClosedReason(String reason) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setClosedReason'");
    }
}
