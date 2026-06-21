package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.BrandDTO;
import com.joseplanes.inven.model.Brand;
import org.springframework.stereotype.Component;

@Component
public class BrandMapper {

    public BrandDTO toDTO(Brand brand) {
        if (brand == null) return null;
        return BrandDTO.builder()
                .brandId(brand.getBrandId())
                .name(brand.getName())
                .description(brand.getDescription())
                .status(brand.getStatus())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }

    public Brand toEntity(BrandDTO dto) {
        if (dto == null) return null;
        return Brand.builder()
                .brandId(dto.getBrandId())
                .name(dto.getName())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : "active")
                .build();
    }
}
