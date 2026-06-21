package com.joseplanes.inven.service;

import com.joseplanes.inven.dto.LocationDTO;
import com.joseplanes.inven.exception.DuplicateResourceException;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.LocationMapper;
import com.joseplanes.inven.model.Location;
import com.joseplanes.inven.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final LocationMapper locationMapper;

    public List<LocationDTO> findAll() {
        return locationRepository.findByStatusNot("disabled")
                .stream().map(locationMapper::toDTO).collect(Collectors.toList());
    }

    public LocationDTO findById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));
        return locationMapper.toDTO(location);
    }

    public LocationDTO findByName(String name) {
        Location location = locationRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "name", name));
        return locationMapper.toDTO(location);
    }

    public LocationDTO create(LocationDTO dto) {
        if (locationRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("Location", "name", dto.getName());
        }
        dto.setStatus("active");
        Location saved = locationRepository.save(locationMapper.toEntity(dto));
        return locationMapper.toDTO(saved);
    }

    public LocationDTO update(Long id, LocationDTO dto) {
        Location existing = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));

        if (!existing.getName().equalsIgnoreCase(dto.getName()) &&
                locationRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("Location", "name", dto.getName());
        }

        existing.setName(dto.getName());
        existing.setType(dto.getType());
        existing.setDescription(dto.getDescription());
        return locationMapper.toDTO(locationRepository.save(existing));
    }

    public LocationDTO updateStatus(Long id, String status) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", id));
        location.setStatus(status);
        return locationMapper.toDTO(locationRepository.save(location));
    }

    public void deactivate(Long id) {
        updateStatus(id, "disabled");
    }

    public void activate(Long id) {
        updateStatus(id, "active");
    }
}
