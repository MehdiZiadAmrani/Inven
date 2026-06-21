package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.IncidenciaDTO;
import com.joseplanes.inven.model.Incidencia;
import com.joseplanes.inven.model.Product;
import com.joseplanes.inven.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class IncidenciaMapper {

    private final ProductRepository productRepository;

    public IncidenciaDTO toDTO(Incidencia incidencia) {
        if (incidencia == null) return null;
        return IncidenciaDTO.builder()
                .incidenciaId(incidencia.getIncidenciaId())
                .title(incidencia.getTitle())
                .description(incidencia.getDescription())
                .priority(incidencia.getPriority())
                .status(incidencia.getStatus())
                .previousProductStatus(incidencia.getPreviousProductStatus())
                .productId(incidencia.getProduct() != null ? incidencia.getProduct().getProductId() : null)
                .productName(incidencia.getProduct() != null ? incidencia.getProduct().getBundleName() : null)
                .createdAt(incidencia.getCreatedAt())
                .updatedAt(incidencia.getUpdatedAt())
                .resolvedAt(incidencia.getResolvedAt())
                .build();
    }

    public Incidencia toEntity(IncidenciaDTO dto) {
        if (dto == null) return null;
        Product product = null;
        if (dto.getProductId() != null) {
            product = productRepository.findById(dto.getProductId()).orElse(null);
        }
        return Incidencia.builder()
                .incidenciaId(dto.getIncidenciaId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority() != null ? dto.getPriority() : "low")
                .status(dto.getStatus() != null ? dto.getStatus() : "open")
                .previousProductStatus(dto.getPreviousProductStatus())
                .product(product)
                .build();
    }
}
