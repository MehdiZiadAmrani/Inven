package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.IncidenciaDTO;
import com.joseplanes.inven.service.IncidenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/incidencias")
@RequiredArgsConstructor
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    @GetMapping
    public ResponseEntity<List<IncidenciaDTO>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long productId) {
        if (status != null && productId != null) {
            return ResponseEntity.ok(incidenciaService.findByProductId(productId));
        } else if (status != null) {
            return ResponseEntity.ok(incidenciaService.findByStatus(status));
        } else if (productId != null) {
            return ResponseEntity.ok(incidenciaService.findByProductId(productId));
        }
        return ResponseEntity.ok(incidenciaService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidenciaDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(incidenciaService.findById(id));
    }

    @PostMapping
    public ResponseEntity<IncidenciaDTO> create(@RequestBody IncidenciaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(incidenciaService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidenciaDTO> update(@PathVariable Long id, @RequestBody IncidenciaDTO dto) {
        return ResponseEntity.ok(incidenciaService.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidenciaDTO> updateStatus(@PathVariable Long id,
                                                       @RequestParam String status) {
        return ResponseEntity.ok(incidenciaService.transitionStatus(id, status));
    }
}
