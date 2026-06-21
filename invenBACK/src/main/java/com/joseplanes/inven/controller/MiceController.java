package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.MiceDTO;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.MiceMapper;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.model.Mice;
import com.joseplanes.inven.model.Supplier;
import com.joseplanes.inven.repository.ItemTypeRepository;
import com.joseplanes.inven.repository.MiceRepository;
import com.joseplanes.inven.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mice")
@RequiredArgsConstructor
public class MiceController {

    private final MiceRepository miceRepository;
    private final SupplierRepository supplierRepository;
    private final ItemTypeRepository itemTypeRepository;
    private final MiceMapper miceMapper;

    @GetMapping
    public ResponseEntity<List<MiceDTO>> getAll() {
        return ResponseEntity.ok(miceRepository.findAll()
                .stream().map(miceMapper::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MiceDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(miceMapper.toDTO(miceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mouse", id))));
    }

    @GetMapping("/in-stock")
    public ResponseEntity<List<MiceDTO>> getInStock() {
        return ResponseEntity.ok(miceRepository.findByStockQuantityGreaterThan(0)
                .stream().map(miceMapper::toDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<MiceDTO> create(@RequestBody MiceDTO dto) {
        Supplier supplier = dto.getSupplierId() != null
                ? supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()))
                : null;
        ItemType itemType = dto.getTypeId() != null
                ? itemTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ItemType", dto.getTypeId()))
                : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(miceMapper.toDTO(miceRepository.save(miceMapper.toEntity(dto, supplier, itemType))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MiceDTO> update(@PathVariable Integer id, @RequestBody MiceDTO dto) {
        miceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Mouse", id));
        Supplier supplier = dto.getSupplierId() != null
                ? supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()))
                : null;
        ItemType itemType = dto.getTypeId() != null
                ? itemTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ItemType", dto.getTypeId()))
                : null;
        dto.setMouseId(id);
        return ResponseEntity.ok(miceMapper.toDTO(miceRepository.save(miceMapper.toEntity(dto, supplier, itemType))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MiceDTO> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Mice mice = miceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mouse", id));
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        mice.setStatus(status);
        return ResponseEntity.ok(miceMapper.toDTO(miceRepository.save(mice)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!miceRepository.existsById(id)) throw new ResourceNotFoundException("Mouse", id);
        miceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
