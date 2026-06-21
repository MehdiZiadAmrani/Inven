package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.InventoryMovementDTO;
import com.joseplanes.inven.model.InventoryMovement;
import org.springframework.stereotype.Component;

@Component
public class InventoryMovementMapper {

    public InventoryMovementDTO toDTO(InventoryMovement movement) {
        if (movement == null) return null;
        return InventoryMovementDTO.builder()
                .movementId(movement.getMovementId())
                .itemType(movement.getItemType())
                .itemId(movement.getItemId())
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .movementDate(movement.getMovementDate())
                .notes(movement.getNotes())
                .build();
    }

    public InventoryMovement toEntity(InventoryMovementDTO dto) {
        if (dto == null) return null;
        return InventoryMovement.builder()
                .movementId(dto.getMovementId())
                .itemType(dto.getItemType())
                .itemId(dto.getItemId())
                .movementType(dto.getMovementType())
                .quantity(dto.getQuantity())
                .movementDate(dto.getMovementDate())
                .notes(dto.getNotes())
                .build();
    }
}
