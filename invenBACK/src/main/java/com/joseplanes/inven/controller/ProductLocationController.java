package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.ProductLocationDTO;
import com.joseplanes.inven.service.ProductLocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/locations")
@RequiredArgsConstructor
public class ProductLocationController {

    private final ProductLocationService locationService;

    @GetMapping
    public ResponseEntity<List<ProductLocationDTO>> getLocationHistory(@PathVariable Integer productId) {
        return ResponseEntity.ok(locationService.getLocationHistory(productId));
    }

    @GetMapping("/current")
    public ResponseEntity<ProductLocationDTO> getCurrentLocation(@PathVariable Integer productId) {
        ProductLocationDTO current = locationService.getCurrentLocation(productId);
        if (current == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(current);
    }

    @PostMapping
    public ResponseEntity<ProductLocationDTO> recordMove(
            @PathVariable Integer productId,
            @Valid @RequestBody ProductLocationDTO dto) {
        dto.setProductId(productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.recordMove(dto));
    }

    @DeleteMapping("/{locationId}")
    public ResponseEntity<Void> deleteLocation(
            @PathVariable Integer productId,
            @PathVariable Integer locationId) {
        locationService.deleteLocation(locationId);
        return ResponseEntity.noContent().build();
    }
}
