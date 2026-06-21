package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.LocationDTO;
import com.joseplanes.inven.model.Location;
import org.springframework.stereotype.Component;

@Component
public class LocationMapper {

    public LocationDTO toDTO(Location location) {
        if (location == null) return null;
        return LocationDTO.builder()
                .locationId(location.getLocationId())
                .name(location.getName())
                .type(location.getType())
                .description(location.getDescription())
                .status(location.getStatus())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }

    public Location toEntity(LocationDTO dto) {
        if (dto == null) return null;
        return Location.builder()
                .locationId(dto.getLocationId())
                .name(dto.getName())
                .type(dto.getType())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : "active")
                .build();
    }
}
