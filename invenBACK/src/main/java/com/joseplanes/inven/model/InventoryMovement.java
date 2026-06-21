package com.joseplanes.inven.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movement_id")
    private Integer movementId;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType;

    @Column(name = "item_id", nullable = false)
    private Integer itemId;

    @Column(name = "movement_type", nullable = false, length = 3)
    private String movementType;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "movement_date")
    private LocalDateTime movementDate;

    @Column(name = "notes", length = 255)
    private String notes;

    @PrePersist
    public void prePersist() {
        if (movementDate == null) movementDate = LocalDateTime.now();
    }
}
