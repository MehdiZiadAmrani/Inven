package com.joseplanes.inven.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "item_locations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"item_type", "item_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType;

    @Column(name = "item_id", nullable = false)
    private Integer itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "assigned_at")
    @Builder.Default
    private LocalDateTime assignedAt = LocalDateTime.now();
}