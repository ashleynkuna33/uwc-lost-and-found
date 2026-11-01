package com.uwcandfound.app.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "item_images")
@Getter
@Setter
@NoArgsConstructor
public class ItemImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long id;

    // This side owns the foreign key column.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "report_id", nullable = false)
    private Reports report;

    // A path or URL to the file on disk, never the image bytes.
    @Column(name = "image_path", nullable = false, length = 500)
    private String imagePath;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;
}