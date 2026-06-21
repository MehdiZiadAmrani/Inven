package com.joseplanes.inven.mapper;

import com.joseplanes.inven.dto.ProductDTO;
import com.joseplanes.inven.model.*;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO toDTO(Product product) {
        if (product == null) return null;
        return ProductDTO.builder()
                .productId(product.getProductId())
                .bundleName(product.getBundleName())
                .monitorId(product.getMonitor() != null ? product.getMonitor().getMonitorId() : null)
                .monitorModel(product.getMonitor() != null ? product.getMonitor().getModel() : null)
                .mouseId(product.getMouse() != null ? product.getMouse().getMouseId() : null)
                .mouseModel(product.getMouse() != null ? product.getMouse().getModel() : null)
                .keyboardId(product.getKeyboard() != null ? product.getKeyboard().getKeyboardId() : null)
                .keyboardModel(product.getKeyboard() != null ? product.getKeyboard().getModel() : null)
                .computerId(product.getComputer() != null ? product.getComputer().getComputerId() : null)
                .computerModel(product.getComputer() != null ? product.getComputer().getModel() : null)
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .build();
    }

    public Product toEntity(ProductDTO dto, Monitor monitor, Mice mouse, Keyboard keyboard, Computer computer) {
        if (dto == null) return null;
        return Product.builder()
                .productId(dto.getProductId())
                .bundleName(dto.getBundleName())
                .monitor(monitor)
                .mouse(mouse)
                .keyboard(keyboard)
                .computer(computer)
                .status(dto.getStatus() != null ? dto.getStatus() : "available")
                .build();
    }
}
