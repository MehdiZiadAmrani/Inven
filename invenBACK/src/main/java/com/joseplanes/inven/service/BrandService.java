package com.joseplanes.inven.service;

import com.joseplanes.inven.dto.BrandDTO;
import com.joseplanes.inven.exception.DuplicateResourceException;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.BrandMapper;
import com.joseplanes.inven.model.Brand;
import com.joseplanes.inven.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    public List<BrandDTO> findAll() {
        return brandRepository.findByStatusNot("disabled")
                .stream().map(brandMapper::toDTO).collect(Collectors.toList());
    }

    public BrandDTO findById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", id));
        return brandMapper.toDTO(brand);
    }

    public BrandDTO create(BrandDTO dto) {
        if (brandRepository.findByNameIgnoreCase(dto.getName()).isPresent()) {
            throw new DuplicateResourceException("Brand", "name", dto.getName());
        }
        Brand brand = brandMapper.toEntity(dto);
        brand.setStatus("active");
        Brand saved = brandRepository.save(brand);
        return brandMapper.toDTO(saved);
    }

    public BrandDTO update(Long id, BrandDTO dto) {
        Brand existing = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", id));

        if (!existing.getName().equalsIgnoreCase(dto.getName()) &&
                brandRepository.findByNameIgnoreCase(dto.getName()).isPresent()) {
            throw new DuplicateResourceException("Brand", "name", dto.getName());
        }

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        return brandMapper.toDTO(brandRepository.save(existing));
    }

    public BrandDTO deactivate(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", id));
        brand.setStatus("disabled");
        return brandMapper.toDTO(brandRepository.save(brand));
    }

    public BrandDTO activate(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", id));
        brand.setStatus("active");
        return brandMapper.toDTO(brandRepository.save(brand));
    }
}
