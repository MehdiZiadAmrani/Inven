package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.LocationDTO;
import com.joseplanes.inven.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<List<LocationDTO>> getAll() {
        return ResponseEntity.ok(locationService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LocationDTO> create(@RequestBody LocationDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LocationDTO> update(@PathVariable Long id, @RequestBody LocationDTO dto) {
        return ResponseEntity.ok(locationService.update(id, dto));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<LocationDTO> updateStatus(@PathVariable Long id,
                                                     @RequestParam String status) {
        return ResponseEntity.ok(locationService.updateStatus(id, status));
    }
}
