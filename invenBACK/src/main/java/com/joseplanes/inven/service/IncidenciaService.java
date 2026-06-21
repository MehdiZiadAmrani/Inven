package com.joseplanes.inven.service;

import com.joseplanes.inven.dto.IncidenciaDTO;
import com.joseplanes.inven.exception.ResourceNotFoundException;
import com.joseplanes.inven.mapper.IncidenciaMapper;
import com.joseplanes.inven.model.Incidencia;
import com.joseplanes.inven.model.Product;
import com.joseplanes.inven.repository.IncidenciaRepository;
import com.joseplanes.inven.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final ProductRepository productRepository;
    private final IncidenciaMapper incidenciaMapper;

    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            "open", Set.of("in_progress", "closed"),
            "in_progress", Set.of("resolved", "closed"),
            "resolved", Set.of("closed")
    );

    public List<IncidenciaDTO> findAll() {
        return incidenciaRepository.findAll()
                .stream().map(incidenciaMapper::toDTO).collect(Collectors.toList());
    }

    public IncidenciaDTO findById(Long id) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia", id.intValue()));
        return incidenciaMapper.toDTO(incidencia);
    }

    public List<IncidenciaDTO> findByStatus(String status) {
        return incidenciaRepository.findByStatus(status)
                .stream().map(incidenciaMapper::toDTO).collect(Collectors.toList());
    }

    public List<IncidenciaDTO> findByProductId(Long productId) {
        return incidenciaRepository.findByProductProductId(productId)
                .stream().map(incidenciaMapper::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public IncidenciaDTO create(IncidenciaDTO dto) {
        Product product = null;
        if (dto.getProductId() != null) {
            product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", dto.getProductId()));
        }

        Incidencia incidencia = incidenciaMapper.toEntity(dto);

        if (product != null) {
            incidencia.setPreviousProductStatus(product.getStatus());
            product.setStatus("maintenance");
            productRepository.save(product);
        }

        Incidencia saved = incidenciaRepository.save(incidencia);
        return incidenciaMapper.toDTO(saved);
    }

    @Transactional
    public IncidenciaDTO update(Long id, IncidenciaDTO dto) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia", id.intValue()));

        incidencia.setTitle(dto.getTitle());
        incidencia.setDescription(dto.getDescription());
        incidencia.setPriority(dto.getPriority());

        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", dto.getProductId()));
            incidencia.setProduct(product);
        } else {
            incidencia.setProduct(null);
        }

        return incidenciaMapper.toDTO(incidenciaRepository.save(incidencia));
    }

    @Transactional
    public IncidenciaDTO transitionStatus(Long id, String newStatus) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia", id.intValue()));

        String currentStatus = incidencia.getStatus();
        validateStatusTransition(currentStatus, newStatus);

        incidencia.setStatus(newStatus);

        if ("resolved".equals(newStatus)) {
            incidencia.setResolvedAt(LocalDateTime.now());
            restoreProductStatus(incidencia);
        }

        if ("closed".equals(newStatus) && incidencia.getResolvedAt() == null) {
            incidencia.setResolvedAt(LocalDateTime.now());
        }

        return incidenciaMapper.toDTO(incidenciaRepository.save(incidencia));
    }

    @Transactional
    public IncidenciaDTO resolve(Long id) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia", id.intValue()));

        validateStatusTransition(incidencia.getStatus(), "resolved");

        incidencia.setStatus("resolved");
        incidencia.setResolvedAt(LocalDateTime.now());
        restoreProductStatus(incidencia);

        return incidenciaMapper.toDTO(incidenciaRepository.save(incidencia));
    }

    @Transactional
    public IncidenciaDTO close(Long id) {
        Incidencia incidencia = incidenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incidencia", id.intValue()));

        validateStatusTransition(incidencia.getStatus(), "closed");

        incidencia.setStatus("closed");
        if (incidencia.getResolvedAt() == null) {
            incidencia.setResolvedAt(LocalDateTime.now());
        }

        return incidenciaMapper.toDTO(incidenciaRepository.save(incidencia));
    }

    private void validateStatusTransition(String current, String target) {
        Set<String> allowed = ALLOWED_TRANSITIONS.get(current);
        if (allowed == null || !allowed.contains(target)) {
            throw new IllegalArgumentException(
                    "Invalid status transition from '" + current + "' to '" + target + "'");
        }
    }

    private void restoreProductStatus(Incidencia incidencia) {
        if (incidencia.getProduct() != null && incidencia.getPreviousProductStatus() != null) {
            incidencia.getProduct().setStatus(incidencia.getPreviousProductStatus());
            productRepository.save(incidencia.getProduct());
        }
    }
}
