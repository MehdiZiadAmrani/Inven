package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.SupplierDTO;
import com.joseplanes.inven.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getAll() {
        return ResponseEntity.ok(supplierService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(supplierService.findById(id));
    }

    @PostMapping
    public ResponseEntity<SupplierDTO> create(@RequestBody SupplierDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(supplierService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDTO> update(@PathVariable Integer id, @RequestBody SupplierDTO dto) {
        return ResponseEntity.ok(supplierService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
