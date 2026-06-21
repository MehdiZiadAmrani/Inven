package com.joseplanes.inven.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Integer locationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "location_name", nullable = false, length = 100)
    private String locationName;

    @Column(name = "location_type", length = 20)
    @Builder.Default
    private String locationType = "office";

    @Column(name = "assigned_to", length = 100)
    private String assignedTo;

    @Column(name = "moved_at")
    private LocalDateTime movedAt;

    @Column(name = "moved_by", length = 50)
    private String movedBy;

    @Column(name = "notes", length = 255)
    private String notes;

    @Column(name = "is_current")
    @Builder.Default
    private Boolean isCurrent = true;

    @PrePersist
    public void prePersist() {
        if (movedAt == null) movedAt = LocalDateTime.now();
    }
}
