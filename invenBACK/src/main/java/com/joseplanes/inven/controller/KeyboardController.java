package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.KeyboardDTO;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.KeyboardMapper;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.model.Keyboard;
import com.joseplanes.inven.model.Supplier;
import com.joseplanes.inven.repository.ItemTypeRepository;
import com.joseplanes.inven.repository.KeyboardRepository;
import com.joseplanes.inven.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/keyboards")
@RequiredArgsConstructor
public class KeyboardController {

    private final KeyboardRepository keyboardRepository;
    private final SupplierRepository supplierRepository;
    private final ItemTypeRepository itemTypeRepository;
    private final KeyboardMapper keyboardMapper;

    @GetMapping
    public ResponseEntity<List<KeyboardDTO>> getAll() {
        return ResponseEntity.ok(keyboardRepository.findAll()
                .stream().map(keyboardMapper::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KeyboardDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(keyboardMapper.toDTO(keyboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Keyboard", id))));
    }

    @GetMapping("/in-stock")
    public ResponseEntity<List<KeyboardDTO>> getInStock() {
        return ResponseEntity.ok(keyboardRepository.findByStockQuantityGreaterThan(0)
                .stream().map(keyboardMapper::toDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<KeyboardDTO> create(@RequestBody KeyboardDTO dto) {
        Supplier supplier = dto.getSupplierId() != null
                ? supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()))
                : null;
        ItemType itemType = dto.getTypeId() != null
                ? itemTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ItemType", dto.getTypeId()))
                : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(keyboardMapper.toDTO(keyboardRepository.save(keyboardMapper.toEntity(dto, supplier, itemType))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KeyboardDTO> update(@PathVariable Integer id, @RequestBody KeyboardDTO dto) {
        keyboardRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Keyboard", id));
        Supplier supplier = dto.getSupplierId() != null
                ? supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()))
                : null;
        ItemType itemType = dto.getTypeId() != null
                ? itemTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ItemType", dto.getTypeId()))
                : null;
        dto.setKeyboardId(id);
        return ResponseEntity.ok(keyboardMapper.toDTO(keyboardRepository.save(keyboardMapper.toEntity(dto, supplier, itemType))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<KeyboardDTO> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Keyboard keyboard = keyboardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Keyboard", id));
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        keyboard.setStatus(status);
        return ResponseEntity.ok(keyboardMapper.toDTO(keyboardRepository.save(keyboard)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!keyboardRepository.existsById(id)) throw new ResourceNotFoundException("Keyboard", id);
        keyboardRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
