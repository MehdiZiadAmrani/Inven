package com.joseplanes.inven.service;

import com.joseplanes.inven.dto.SupplierDTO;
import com.joseplanes.inven.exception.DuplicateResourceException;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.SupplierMapper;
import com.joseplanes.inven.model.Supplier;
import com.joseplanes.inven.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    public List<SupplierDTO> findAll() {
        return supplierRepository.findAll()
                .stream().map(supplierMapper::toDTO).collect(Collectors.toList());
    }

    public SupplierDTO findById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        return supplierMapper.toDTO(supplier);
    }

    public SupplierDTO create(SupplierDTO dto) {
        if (dto.getContactEmail() != null &&
            supplierRepository.existsByContactEmail(dto.getContactEmail())) {
            throw new DuplicateResourceException("Supplier", "email", dto.getContactEmail());
        }
        Supplier saved = supplierRepository.save(supplierMapper.toEntity(dto));
        return supplierMapper.toDTO(saved);
    }

    public SupplierDTO update(Integer id, SupplierDTO dto) {
        Supplier existing = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
        existing.setName(dto.getName());
        existing.setContactEmail(dto.getContactEmail());
        existing.setPhone(dto.getPhone());
        existing.setCountry(dto.getCountry());
        return supplierMapper.toDTO(supplierRepository.save(existing));
    }

    public void delete(Integer id) {
        if (!supplierRepository.existsById(id))
            throw new ResourceNotFoundException("Supplier", id);
        supplierRepository.deleteById(id);
    }
}
