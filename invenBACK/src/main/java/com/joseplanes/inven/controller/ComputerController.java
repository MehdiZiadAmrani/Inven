package com.joseplanes.inven.controller;

import com.joseplanes.inven.dto.ComputerDTO;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.ComputerMapper;
import com.joseplanes.inven.model.Computer;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.model.Supplier;
import com.joseplanes.inven.repository.ComputerRepository;
import com.joseplanes.inven.repository.ItemTypeRepository;
import com.joseplanes.inven.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/computers")
@RequiredArgsConstructor
public class ComputerController {

    private final ComputerRepository computerRepository;
    private final SupplierRepository supplierRepository;
    private final ItemTypeRepository itemTypeRepository;
    private final ComputerMapper computerMapper;

    @GetMapping
    public ResponseEntity<List<ComputerDTO>> getAll() {
        return ResponseEntity.ok(computerRepository.findAll()
                .stream().map(computerMapper::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComputerDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(computerMapper.toDTO(computerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Computer", id))));
    }

    @GetMapping("/in-stock")
    public ResponseEntity<List<ComputerDTO>> getInStock() {
        return ResponseEntity.ok(computerRepository.findByStockQuantityGreaterThan(0)
                .stream().map(computerMapper::toDTO).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<ComputerDTO> create(@RequestBody ComputerDTO dto) {
        Supplier supplier = dto.getSupplierId() != null
                ? supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()))
                : null;
        ItemType itemType = dto.getTypeId() != null
                ? itemTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ItemType", dto.getTypeId()))
                : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(computerMapper.toDTO(computerRepository.save(computerMapper.toEntity(dto, supplier, itemType))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComputerDTO> update(@PathVariable Integer id, @RequestBody ComputerDTO dto) {
        computerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Computer", id));
        Supplier supplier = dto.getSupplierId() != null
                ? supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", dto.getSupplierId()))
                : null;
        ItemType itemType = dto.getTypeId() != null
                ? itemTypeRepository.findById(dto.getTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("ItemType", dto.getTypeId()))
                : null;
        dto.setComputerId(id);
        return ResponseEntity.ok(computerMapper.toDTO(computerRepository.save(computerMapper.toEntity(dto, supplier, itemType))));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ComputerDTO> updateStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Computer computer = computerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Computer", id));
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        computer.setStatus(status);
        return ResponseEntity.ok(computerMapper.toDTO(computerRepository.save(computer)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!computerRepository.existsById(id)) throw new ResourceNotFoundException("Computer", id);
        computerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
