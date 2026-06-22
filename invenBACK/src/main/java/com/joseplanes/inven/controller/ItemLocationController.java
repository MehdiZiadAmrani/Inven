package com.joseplanes.inven.controller;

import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.model.ItemLocation;
import com.joseplanes.inven.model.Location;
import com.joseplanes.inven.repository.ItemLocationRepository;
import com.joseplanes.inven.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/product-locations")
@RequiredArgsConstructor
public class ItemLocationController {

    private final ItemLocationRepository itemLocationRepository;
    private final LocationRepository locationRepository;

    // GET /api/product-locations/item/{itemType}/{itemId}
    @GetMapping("/item/{itemType}/{itemId}")
    public ResponseEntity<List<Map<String, Object>>> getCurrent(
            @PathVariable String itemType,
            @PathVariable Integer itemId) {

        return itemLocationRepository.findByItemTypeAndItemId(itemType, itemId)
        .map(il -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("productLocationId", il.getId());
            entry.put("locationId",        il.getLocation().getLocationId());
            entry.put("locationName",      il.getLocation().getName());
            return ResponseEntity.ok(List.of(entry));
        })
        .orElse(ResponseEntity.ok(List.of()));
    }

    // POST /api/product-locations
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> assign(@RequestBody Map<String, Object> body) {
        String itemType = (String) body.get("itemType");
        Integer itemId  = (Integer) body.get("itemId");
        Long locationId = Long.valueOf(body.get("locationId").toString());

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("Location", locationId));

        // Upsert: si ya tiene location la reemplaza
        ItemLocation il = itemLocationRepository
                .findByItemTypeAndItemId(itemType, itemId)
                .orElse(ItemLocation.builder()
                        .itemType(itemType)
                        .itemId(itemId)
                        .build());

        il.setLocation(location);
        ItemLocation saved = itemLocationRepository.save(il);

        return ResponseEntity.ok(Map.of(
                "productLocationId", saved.getId(),
                "locationId",        saved.getLocation().getLocationId(),
                "locationName",      saved.getLocation().getName()
        ));
    }

    // DELETE /api/product-locations/{id}
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        if (!itemLocationRepository.existsById(id))
            throw new ResourceNotFoundException("ItemLocation", id);
        itemLocationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}