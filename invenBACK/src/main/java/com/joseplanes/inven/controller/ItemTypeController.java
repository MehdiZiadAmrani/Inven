package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.ItemTypeDTO;
import com.joseplanes.inven.service.ItemTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/item-types")
@RequiredArgsConstructor
public class ItemTypeController {

    private final ItemTypeService itemTypeService;

    @GetMapping
    public ResponseEntity<List<ItemTypeDTO>> getAll() {
        return ResponseEntity.ok(itemTypeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemTypeDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(itemTypeService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ItemTypeDTO> create(@RequestBody ItemTypeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(itemTypeService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemTypeDTO> update(@PathVariable Integer id, @RequestBody ItemTypeDTO dto) {
        return ResponseEntity.ok(itemTypeService.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ItemTypeDTO> updateStatus(@PathVariable Integer id,
                                                     @RequestParam String status) {
        return ResponseEntity.ok(itemTypeService.updateStatus(id, status));
    }
}
