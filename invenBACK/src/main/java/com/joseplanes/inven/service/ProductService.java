package com.joseplanes.inven.service;

import com.joseplanes.inven.dto.ProductDTO;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.ProductMapper;
import com.joseplanes.inven.model.*;
import com.joseplanes.inven.repository.ProductRepository;
import com.joseplanes.inven.repository.MonitorRepository;
import com.joseplanes.inven.repository.MiceRepository;
import com.joseplanes.inven.repository.KeyboardRepository;
import com.joseplanes.inven.repository.ComputerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final MonitorRepository monitorRepository;
    private final MiceRepository miceRepository;
    private final KeyboardRepository keyboardRepository;
    private final ComputerRepository computerRepository;
    private final ProductMapper productMapper;

    public List<ProductDTO> findAll() {
        return productRepository.findByStatusNot("disabled")
                .stream().map(productMapper::toDTO).collect(Collectors.toList());
    }

    public List<ProductDTO> findByStatus(String status) {
        return productRepository.findByStatus(status)
                .stream().map(productMapper::toDTO).collect(Collectors.toList());
    }

    public ProductDTO findById(Integer id) {
        return productMapper.toDTO(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id)));
    }

    public List<ProductDTO> search(String query) {
        String lowerQuery = query.toLowerCase();
        return productRepository.findAll()
                .stream()
                .filter(p -> !"disabled".equals(p.getStatus()))
                .filter(p -> p.getBundleName().toLowerCase().contains(lowerQuery) ||
                           (p.getMonitor() != null && p.getMonitor().getModel().toLowerCase().contains(lowerQuery)) ||
                           (p.getMouse() != null && p.getMouse().getModel().toLowerCase().contains(lowerQuery)) ||
                           (p.getKeyboard() != null && p.getKeyboard().getModel().toLowerCase().contains(lowerQuery)) ||
                           (p.getComputer() != null && p.getComputer().getModel().toLowerCase().contains(lowerQuery)))
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO create(ProductDTO dto) {
        Monitor monitor = dto.getMonitorId() != null
                ? monitorRepository.findById(dto.getMonitorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Monitor", dto.getMonitorId()))
                : null;
        Mice mouse = dto.getMouseId() != null
                ? miceRepository.findById(dto.getMouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mouse", dto.getMouseId()))
                : null;
        Keyboard keyboard = dto.getKeyboardId() != null
                ? keyboardRepository.findById(dto.getKeyboardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Keyboard", dto.getKeyboardId()))
                : null;
        Computer computer = dto.getComputerId() != null
                ? computerRepository.findById(dto.getComputerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Computer", dto.getComputerId()))
                : null;

        Product saved = productRepository.save(
                productMapper.toEntity(dto, monitor, mouse, keyboard, computer));
        return productMapper.toDTO(saved);
    }

    @Transactional
    public ProductDTO update(Integer id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        product.setBundleName(dto.getBundleName());
        product.setStatus(dto.getStatus());

        if (dto.getMonitorId() != null) {
            product.setMonitor(monitorRepository.findById(dto.getMonitorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Monitor", dto.getMonitorId())));
        } else {
            product.setMonitor(null);
        }

        if (dto.getMouseId() != null) {
            product.setMouse(miceRepository.findById(dto.getMouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mouse", dto.getMouseId())));
        } else {
            product.setMouse(null);
        }

        if (dto.getKeyboardId() != null) {
            product.setKeyboard(keyboardRepository.findById(dto.getKeyboardId())
                    .orElseThrow(() -> new ResourceNotFoundException("Keyboard", dto.getKeyboardId())));
        } else {
            product.setKeyboard(null);
        }

        if (dto.getComputerId() != null) {
            product.setComputer(computerRepository.findById(dto.getComputerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Computer", dto.getComputerId())));
        } else {
            product.setComputer(null);
        }

        return productMapper.toDTO(productRepository.save(product));
    }

    public ProductDTO updateStatus(Integer id, String status) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setStatus(status);
        return productMapper.toDTO(productRepository.save(product));
    }

    @Transactional
    public void delete(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        product.setStatus("disabled");
        productRepository.save(product);
    }
}
