package com.joseplanes.inven.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComputerDTO {
    private Integer computerId;
    private String brand;
    private String model;
    private String type;
    private Integer typeId;
    private String typeName;
    private String cpu;
    private Integer ramGb;
    private Integer storageGb;
    private String storageType;
    private String os;
    private Integer supplierId;
    private String supplierName;
    private String serialNumber;
    private String inventoryCode;
    private java.time.LocalDateTime registeredAt;
    private java.time.LocalDateTime deactivatedAt;
    private Integer stockQuantity;
    private BigDecimal unitPrice;
    private String status;
}
