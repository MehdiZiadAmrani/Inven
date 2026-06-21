package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.InventoryMovementDTO;
import com.joseplanes.inven.service.InventoryMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory-movements")
@RequiredArgsConstructor
public class InventoryMovementController {

    private final InventoryMovementService movementService;

    @GetMapping
    public ResponseEntity<List<InventoryMovementDTO>> getAll() {
        return ResponseEntity.ok(movementService.findAll());
    }

    @GetMapping("/item/{itemType}/{itemId}")
    public ResponseEntity<List<InventoryMovementDTO>> getByItem(
            @PathVariable String itemType, @PathVariable Integer itemId) {
        return ResponseEntity.ok(movementService.findByItem(itemType, itemId));
    }

    @PostMapping
    public ResponseEntity<InventoryMovementDTO> register(@RequestBody InventoryMovementDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(movementService.registerMovement(dto));
    }
}
