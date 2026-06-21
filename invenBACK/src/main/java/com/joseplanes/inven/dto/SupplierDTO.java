package com.joseplanes.inven.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierDTO {
    private Integer supplierId;
    private String name;
    private String contactEmail;
    private String phone;
    private String country;
    private LocalDateTime createdAt;
}
