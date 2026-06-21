package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.MonitorDTO;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.model.Monitor;
import com.joseplanes.inven.model.Supplier;
import org.springframework.stereotype.Component;

@Component
public class MonitorMapper {

    public MonitorDTO toDTO(Monitor monitor) {
        if (monitor == null) return null;
        return MonitorDTO.builder()
                .monitorId(monitor.getMonitorId())
                .brand(monitor.getBrand())
                .model(monitor.getModel())
                .screenSizeIn(monitor.getScreenSizeIn())
                .resolution(monitor.getResolution())
                .panelType(monitor.getPanelType())
                .refreshRateHz(monitor.getRefreshRateHz())
                .supplierId(monitor.getSupplier() != null ? monitor.getSupplier().getSupplierId() : null)
                .supplierName(monitor.getSupplier() != null ? monitor.getSupplier().getName() : null)
                .typeId(monitor.getItemType() != null ? monitor.getItemType().getItemTypeId() : null)
                .typeName(monitor.getItemType() != null ? monitor.getItemType().getName() : null)
                .serialNumber(monitor.getSerialNumber())
                .inventoryCode(monitor.getInventoryCode())
                .registeredAt(monitor.getRegisteredAt())
                .deactivatedAt(monitor.getDeactivatedAt())
                .stockQuantity(monitor.getStockQuantity())
                .unitPrice(monitor.getUnitPrice())
                .status(monitor.getStatus())
                .build();
    }

    public Monitor toEntity(MonitorDTO dto, Supplier supplier, ItemType itemType) {
        if (dto == null) return null;
        return Monitor.builder()
                .monitorId(dto.getMonitorId())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .screenSizeIn(dto.getScreenSizeIn())
                .resolution(dto.getResolution())
                .panelType(dto.getPanelType())
                .refreshRateHz(dto.getRefreshRateHz())
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
