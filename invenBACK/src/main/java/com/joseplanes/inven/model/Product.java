package com.joseplanes.inven.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_product_bundle_name", columnNames = "bundle_name"),
        @UniqueConstraint(name = "uq_product_components",
            columnNames = {"monitor_id", "mouse_id", "keyboard_id", "computer_id"})
    })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @Column(name = "bundle_name", nullable = false, length = 100)
    private String bundleName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "monitor_id")
    private Monitor monitor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mouse_id")
    private Mice mouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "keyboard_id")
    private Keyboard keyboard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "computer_id")
    private Computer computer;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "available";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
