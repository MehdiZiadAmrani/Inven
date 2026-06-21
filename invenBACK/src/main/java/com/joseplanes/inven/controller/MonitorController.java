package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.MonitorDTO;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.MonitorMapper;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.model.Monitor;
import com.joseplanes.inven.model.Supplier;
import com.joseplanes.inven.repository.ItemTypeRepository;
import com.joseplanes.inven.repository.MonitorRepository;
import com.joseplanes.inven.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/monitors")
@RequiredArgsConstructor
public class MonitorController {

    private final MonitorRepository monitorRepository;
    private final SupplierRepository supplierRepository;
    private final ItemTypeRepository itemTypeRepository;
    private final MonitorMapper monitorMapper;

    @GetMapping
    public ResponseEntity<List<MonitorDTO>> getAll() {
        return ResponseEntity.ok(monitorRepository.findAll()
                .stream().map(monitorMapper::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MonitorDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(monitorMapper.toDTO(monitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Monitor", id))));
    }

    @GetMapping("/in-stock")
    public ResponseEntity<List<MonitorDTO>> getInStock() {
        return ResponseEntity.ok(monitorRepository.findByStockQuantityGreaterThan(0)
                .stream().map(monitorMapper::toDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<MonitorDTO> create(@RequestBody MonitorDTO dto) {
        Supplier supplier = dto.getSupplierId() != null
                ? supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()))
                : null;
        ItemType itemType = dto.getTypeId() != null
                ? itemTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ItemType", dto.getTypeId()))
                : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(monitorMapper.toDTO(monitorRepository.save(monitorMapper.toEntity(dto, supplier, itemType))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MonitorDTO> update(@PathVariable Integer id, @RequestBody MonitorDTO dto) {
        monitorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Monitor", id));
        Supplier supplier = dto.getSupplierId() != null
                ? supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()))
                : null;
        ItemType itemType = dto.getTypeId() != null
                ? itemTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ItemType", dto.getTypeId()))
                : null;
        dto.setMonitorId(id);
        return ResponseEntity.ok(monitorMapper.toDTO(monitorRepository.save(monitorMapper.toEntity(dto, supplier, itemType))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MonitorDTO> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Monitor monitor = monitorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Monitor", id));
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        monitor.setStatus(status);
        return ResponseEntity.ok(monitorMapper.toDTO(monitorRepository.save(monitor)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!monitorRepository.existsById(id)) throw new ResourceNotFoundException("Monitor", id);
        monitorRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
