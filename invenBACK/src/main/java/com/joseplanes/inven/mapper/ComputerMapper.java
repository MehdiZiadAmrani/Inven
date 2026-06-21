package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.ComputerDTO;
import com.joseplanes.inven.model.Computer;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.model.Supplier;
import org.springframework.stereotype.Component;

@Component
public class ComputerMapper {

    public ComputerDTO toDTO(Computer computer) {
        if (computer == null) return null;
        return ComputerDTO.builder()
                .computerId(computer.getComputerId())
                .brand(computer.getBrand())
                .model(computer.getModel())
                .type(computer.getType())
                .typeId(computer.getItemType() != null ? computer.getItemType().getItemTypeId() : null)
                .typeName(computer.getItemType() != null ? computer.getItemType().getName() : null)
                .cpu(computer.getCpu())
                .ramGb(computer.getRamGb())
                .storageGb(computer.getStorageGb())
                .storageType(computer.getStorageType())
                .os(computer.getOs())
                .supplierId(computer.getSupplier() != null ? computer.getSupplier().getSupplierId() : null)
                .supplierName(computer.getSupplier() != null ? computer.getSupplier().getName() : null)
                .serialNumber(computer.getSerialNumber())
                .inventoryCode(computer.getInventoryCode())
                .registeredAt(computer.getRegisteredAt())
                .deactivatedAt(computer.getDeactivatedAt())
                .stockQuantity(computer.getStockQuantity())
                .unitPrice(computer.getUnitPrice())
                .status(computer.getStatus())
                .build();
    }

    public Computer toEntity(ComputerDTO dto, Supplier supplier, ItemType itemType) {
        if (dto == null) return null;
        return Computer.builder()
                .computerId(dto.getComputerId())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .type(dto.getType())
                .itemType(itemType)
                .cpu(dto.getCpu())
                .ramGb(dto.getRamGb())
                .storageGb(dto.getStorageGb())
                .storageType(dto.getStorageType())
                .os(dto.getOs())
                .supplier(supplier)
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
