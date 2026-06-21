package com.joseplanes.inven.service;

import com.joseplanes.inven.dto.InventoryMovementDTO;
import com.joseplanes.inven.exception.InsufficientStockException;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.InventoryMovementMapper;
import com.joseplanes.inven.model.*;
import com.joseplanes.inven.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryMovementService {

    private final InventoryMovementRepository movementRepository;
    private final MonitorRepository monitorRepository;
    private final MiceRepository miceRepository;
    private final KeyboardRepository keyboardRepository;
    private final ComputerRepository computerRepository;
    private final InventoryMovementMapper movementMapper;

    public List<InventoryMovementDTO> findAll() {
        return movementRepository.findAll()
                .stream().map(movementMapper::toDTO).collect(Collectors.toList());
    }

    public List<InventoryMovementDTO> findByItem(String itemType, Integer itemId) {
        return movementRepository.findByItemTypeAndItemId(itemType, itemId)
                .stream().map(movementMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public InventoryMovementDTO registerMovement(InventoryMovementDTO dto) {
        validateItemExists(dto.getItemType(), dto.getItemId());

        if ("OUT".equals(dto.getMovementType())) {
            int currentStock = getStock(dto.getItemType(), dto.getItemId());
            if (currentStock < dto.getQuantity()) {
                throw new InsufficientStockException(
                    dto.getItemType(), dto.getItemId(), dto.getQuantity(), currentStock);
            }
        }

        updateStock(dto.getItemType(), dto.getItemId(), dto.getMovementType(), dto.getQuantity());
        InventoryMovement saved = movementRepository.save(movementMapper.toEntity(dto));
        return movementMapper.toDTO(saved);
    }

    private void validateItemExists(String itemType, Integer itemId) {
        switch (itemType.toLowerCase()) {
            case "monitor"  -> monitorRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException("Monitor", itemId));
            case "mouse"    -> miceRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException("Mouse", itemId));
            case "keyboard" -> keyboardRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException("Keyboard", itemId));
            case "computer" -> computerRepository.findById(itemId)
                                .orElseThrow(() -> new ResourceNotFoundException("Computer", itemId));
            default -> throw new IllegalArgumentException("Unknown item type: " + itemType);
        }
    }

    private int getStock(String itemType, Integer itemId) {
        return switch (itemType.toLowerCase()) {
            case "monitor"  -> monitorRepository.findById(itemId).map(Monitor::getStockQuantity).orElse(0);
            case "mouse"    -> miceRepository.findById(itemId).map(Mice::getStockQuantity).orElse(0);
            case "keyboard" -> keyboardRepository.findById(itemId).map(Keyboard::getStockQuantity).orElse(0);
            case "computer" -> computerRepository.findById(itemId).map(Computer::getStockQuantity).orElse(0);
            default -> 0;
        };
    }

    private void updateStock(String itemType, Integer itemId, String movementType, int quantity) {
        int delta = "IN".equals(movementType) ? quantity : -quantity;
        switch (itemType.toLowerCase()) {
            case "monitor" -> {
                Monitor m = monitorRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Monitor", itemId));
                m.setStockQuantity(m.getStockQuantity() + delta);
                monitorRepository.save(m);
            }
            case "mouse" -> {
                Mice m = miceRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Mouse", itemId));
                m.setStockQuantity(m.getStockQuantity() + delta);
                miceRepository.save(m);
            }
            case "keyboard" -> {
                Keyboard k = keyboardRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Keyboard", itemId));
                k.setStockQuantity(k.getStockQuantity() + delta);
                keyboardRepository.save(k);
            }
            case "computer" -> {
                Computer c = computerRepository.findById(itemId)
                        .orElseThrow(() -> new ResourceNotFoundException("Computer", itemId));
                c.setStockQuantity(c.getStockQuantity() + delta);
                computerRepository.save(c);
            }
        }
    }
}
