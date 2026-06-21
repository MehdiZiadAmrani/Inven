package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.ItemTypeDTO;
import com.joseplanes.inven.model.ItemType;
import org.springframework.stereotype.Component;

@Component
public class ItemTypeMapper {

    public ItemTypeDTO toDTO(ItemType itemType) {
        if (itemType == null) return null;
        return ItemTypeDTO.builder()
                .itemTypeId(itemType.getItemTypeId())
                .name(itemType.getName())
                .status(itemType.getStatus())
                .createdAt(itemType.getCreatedAt())
                .build();
    }

    public ItemType toEntity(ItemTypeDTO dto) {
        if (dto == null) return null;
        return ItemType.builder()
                .itemTypeId(dto.getItemTypeId())
                .name(dto.getName())
                .status(dto.getStatus() != null ? dto.getStatus() : "active")
                .build();
    }
}
