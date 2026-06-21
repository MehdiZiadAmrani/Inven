package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.KeyboardDTO;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.model.Keyboard;
import com.joseplanes.inven.model.Supplier;
import org.springframework.stereotype.Component;

@Component
public class KeyboardMapper {

    public KeyboardDTO toDTO(Keyboard keyboard) {
        if (keyboard == null) return null;
        return KeyboardDTO.builder()
                .keyboardId(keyboard.getKeyboardId())
                .brand(keyboard.getBrand())
                .model(keyboard.getModel())
                .switchType(keyboard.getSwitchType())
                .layout(keyboard.getLayout())
                .wireless(keyboard.getWireless())
                .supplierId(keyboard.getSupplier() != null ? keyboard.getSupplier().getSupplierId() : null)
                .supplierName(keyboard.getSupplier() != null ? keyboard.getSupplier().getName() : null)
                .typeId(keyboard.getItemType() != null ? keyboard.getItemType().getItemTypeId() : null)
                .typeName(keyboard.getItemType() != null ? keyboard.getItemType().getName() : null)
                .serialNumber(keyboard.getSerialNumber())
                .inventoryCode(keyboard.getInventoryCode())
                .registeredAt(keyboard.getRegisteredAt())
                .deactivatedAt(keyboard.getDeactivatedAt())
                .stockQuantity(keyboard.getStockQuantity())
                .unitPrice(keyboard.getUnitPrice())
                .status(keyboard.getStatus())
                .build();
    }

    public Keyboard toEntity(KeyboardDTO dto, Supplier supplier, ItemType itemType) {
        if (dto == null) return null;
        return Keyboard.builder()
                .keyboardId(dto.getKeyboardId())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .switchType(dto.getSwitchType())
                .layout(dto.getLayout())
                .wireless(dto.getWireless() != null ? dto.getWireless() : false)
                .supplier(supplier)
                .itemType(itemType)
                .serialNumber(dto.getSerialNumber())
                .inventoryCode(dto.getInventoryCode())
                .registeredAt(dto.getRegisteredAt())
                .deactivatedAt(dto.getDeactivatedAt())
                .stockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 0)
                .unitPrice(dto.getUnitPrice())
                .status(dto.getStatus() != null ? dto.getStatus() : "available")
                .build();
    }
}
