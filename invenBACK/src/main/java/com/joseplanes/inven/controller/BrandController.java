package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.BrandDTO;
import com.joseplanes.inven.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAll() {
        return ResponseEntity.ok(brandService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(brandService.findById(id));
    }

    @PostMapping
    public ResponseEntity<BrandDTO> create(@RequestBody BrandDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandDTO> update(@PathVariable Long id, @RequestBody BrandDTO dto) {
        return ResponseEntity.ok(brandService.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BrandDTO> updateStatus(@PathVariable Long id, @RequestParam String status) {
        if ("active".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(brandService.activate(id));
        }
        return ResponseEntity.ok(brandService.deactivate(id));
    }
}
