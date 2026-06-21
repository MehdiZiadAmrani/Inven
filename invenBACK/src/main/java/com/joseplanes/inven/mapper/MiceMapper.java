package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.MiceDTO;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.model.Mice;
import com.joseplanes.inven.model.Supplier;
import org.springframework.stereotype.Component;

@Component
public class MiceMapper {

    public MiceDTO toDTO(Mice mice) {
        if (mice == null) return null;
        return MiceDTO.builder()
                .mouseId(mice.getMouseId())
                .brand(mice.getBrand())
                .model(mice.getModel())
                .connectionType(mice.getConnectionType())
                .dpiMax(mice.getDpiMax())
                .wireless(mice.getWireless())
                .supplierId(mice.getSupplier() != null ? mice.getSupplier().getSupplierId() : null)
                .supplierName(mice.getSupplier() != null ? mice.getSupplier().getName() : null)
                .typeId(mice.getItemType() != null ? mice.getItemType().getItemTypeId() : null)
                .typeName(mice.getItemType() != null ? mice.getItemType().getName() : null)
                .serialNumber(mice.getSerialNumber())
                .inventoryCode(mice.getInventoryCode())
                .registeredAt(mice.getRegisteredAt())
                .deactivatedAt(mice.getDeactivatedAt())
                .stockQuantity(mice.getStockQuantity())
                .unitPrice(mice.getUnitPrice())
                .status(mice.getStatus())
                .build();
    }

    public Mice toEntity(MiceDTO dto, Supplier supplier, ItemType itemType) {
        if (dto == null) return null;
        return Mice.builder()
                .mouseId(dto.getMouseId())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .connectionType(dto.getConnectionType())
                .dpiMax(dto.getDpiMax())
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
