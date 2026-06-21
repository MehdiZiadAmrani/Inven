package com.joseplanes.inven.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MiceDTO {
    private Integer mouseId;
    private String brand;
    private String model;
    private String connectionType;
    private Integer dpiMax;
    private Boolean wireless;
    private Integer supplierId;
    private String supplierName;
    private Integer typeId;
    private String typeName;
    private String serialNumber;
    private String inventoryCode;
    private java.time.LocalDateTime registeredAt;
    private java.time.LocalDateTime deactivatedAt;
    private Integer stockQuantity;
    private BigDecimal unitPrice;
    private String status;
}
