package com.joseplanes.inven.service;

import com.joseplanes.inven.dto.ItemTypeDTO;
import com.joseplanes.inven.exception.DuplicateResourceException;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.ItemTypeMapper;
import com.joseplanes.inven.model.ItemType;
import com.joseplanes.inven.repository.ItemTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemTypeService {

    private final ItemTypeRepository itemTypeRepository;
    private final ItemTypeMapper itemTypeMapper;

    public List<ItemTypeDTO> findAll() {
        return itemTypeRepository.findAll()
                .stream().map(itemTypeMapper::toDTO).collect(Collectors.toList());
    }

    public ItemTypeDTO findById(Integer id) {
        ItemType itemType = itemTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemType", id));
        return itemTypeMapper.toDTO(itemType);
    }

    public ItemTypeDTO create(ItemTypeDTO dto) {
        if (itemTypeRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("ItemType", "name", dto.getName());
        }
        ItemType saved = itemTypeRepository.save(itemTypeMapper.toEntity(dto));
        return itemTypeMapper.toDTO(saved);
    }

    public ItemTypeDTO update(Integer id, ItemTypeDTO dto) {
        ItemType existing = itemTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemType", id));

        if (!existing.getName().equalsIgnoreCase(dto.getName()) &&
                itemTypeRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new DuplicateResourceException("ItemType", "name", dto.getName());
        }

        existing.setName(dto.getName());
        return itemTypeMapper.toDTO(itemTypeRepository.save(existing));
    }

    public ItemTypeDTO updateStatus(Integer id, String status) {
        ItemType itemType = itemTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ItemType", id));
        itemType.setStatus(status);
        return itemTypeMapper.toDTO(itemTypeRepository.save(itemType));
    }
}
