package com.joseplanes.inven.service;

import com.joseplanes.inven.dto.ProductLocationDTO;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.ProductLocationMapper;
import com.joseplanes.inven.model.Product;
import com.joseplanes.inven.model.ProductLocation;
import com.joseplanes.inven.repository.ProductLocationRepository;
import com.joseplanes.inven.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductLocationService {

    private final ProductLocationRepository locationRepository;
    private final ProductRepository productRepository;
    private final ProductLocationMapper locationMapper;

    public List<ProductLocationDTO> getLocationHistory(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        if ("disabled".equals(product.getStatus())) {
            return Collections.emptyList();
        }
        return locationRepository.findByProductProductIdOrderByMovedAtDesc(productId)
                .stream().map(locationMapper::toDTO).collect(Collectors.toList());
    }

    public ProductLocationDTO getCurrentLocation(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        if ("disabled".equals(product.getStatus())) {
            return null;
        }
        return locationRepository.findByProductProductIdAndIsCurrentTrue(productId)
                .stream()
                .findFirst()
                .map(locationMapper::toDTO)
                .orElse(null);
    }

    @Transactional
    public ProductLocationDTO recordMove(ProductLocationDTO dto) {
        // Find the product
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", dto.getProductId()));

        // Mark all previous locations as not current
        locationRepository.markAllAsNotCurrent(dto.getProductId());

        // Create new location entry
        ProductLocation location = locationMapper.toEntity(dto);
        location.setProduct(product);
        location.setIsCurrent(true);

        ProductLocation saved = locationRepository.save(location);
        return locationMapper.toDTO(saved);
    }

    @Transactional
    public void deleteLocation(Integer locationId) {
        ProductLocation location = locationRepository.findById(locationId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductLocation", locationId));

        // If this was the current location, mark the most recent remaining as current
        if (Boolean.TRUE.equals(location.getIsCurrent())) {
            locationRepository.markAllAsNotCurrent(location.getProduct().getProductId());
            List<ProductLocation> remaining = locationRepository
                    .findByProductProductIdOrderByMovedAtDesc(location.getProduct().getProductId());
            if (!remaining.isEmpty()) {
                remaining.get(0).setIsCurrent(true);
                locationRepository.save(remaining.get(0));
            }
        }

        locationRepository.delete(location);
    }
}
