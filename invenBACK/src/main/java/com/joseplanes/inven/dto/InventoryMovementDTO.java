package com.joseplanes.inven.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryMovementDTO {
    private Integer movementId;
    private String itemType;
    private Integer itemId;
    private String movementType;
    private Integer quantity;
    private LocalDateTime movementDate;
    private String notes;
}
