package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Integer> {
    List<InventoryMovement> findByItemTypeAndItemId(String itemType, Integer itemId);
    List<InventoryMovement> findByMovementType(String movementType);
}
