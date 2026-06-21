package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.SupplierDTO;
import com.joseplanes.inven.model.Supplier;
import org.springframework.stereotype.Component;

@Component
public class SupplierMapper {

    public SupplierDTO toDTO(Supplier supplier) {
        if (supplier == null) return null;
        return SupplierDTO.builder()
                .supplierId(supplier.getSupplierId())
                .name(supplier.getName())
                .contactEmail(supplier.getContactEmail())
                .phone(supplier.getPhone())
                .country(supplier.getCountry())
                .createdAt(supplier.getCreatedAt())
                .build();
    }

    public Supplier toEntity(SupplierDTO dto) {
        if (dto == null) return null;
        return Supplier.builder()
                .supplierId(dto.getSupplierId())
                .name(dto.getName())
                .contactEmail(dto.getContactEmail())
                .phone(dto.getPhone())
                .country(dto.getCountry())
                .build();
    }
}
