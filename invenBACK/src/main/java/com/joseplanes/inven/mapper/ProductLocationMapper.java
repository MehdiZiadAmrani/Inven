package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.ProductLocationDTO;
import com.joseplanes.inven.model.ProductLocation;
import org.springframework.stereotype.Component;

@Component
public class ProductLocationMapper {

    public ProductLocationDTO toDTO(ProductLocation entity) {
        if (entity == null) return null;
        return ProductLocationDTO.builder()
                .locationId(entity.getLocationId())
                .productId(entity.getProduct() != null ? entity.getProduct().getProductId() : null)
                .locationName(entity.getLocationName())
                .locationType(entity.getLocationType())
                .assignedTo(entity.getAssignedTo())
                .movedAt(entity.getMovedAt())
                .movedBy(entity.getMovedBy())
                .notes(entity.getNotes())
                .isCurrent(entity.getIsCurrent())
                .build();
    }

    public ProductLocation toEntity(ProductLocationDTO dto) {
        if (dto == null) return null;
        return ProductLocation.builder()
                .locationId(dto.getLocationId())
                .locationName(dto.getLocationName())
                .locationType(dto.getLocationType())
                .assignedTo(dto.getAssignedTo())
                .movedAt(dto.getMovedAt())
                .movedBy(dto.getMovedBy())
                .notes(dto.getNotes())
                .isCurrent(dto.getIsCurrent() != null ? dto.getIsCurrent() : true)
                .build();
    }
}
