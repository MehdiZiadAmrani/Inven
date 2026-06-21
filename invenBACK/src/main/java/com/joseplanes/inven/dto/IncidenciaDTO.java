package com.joseplanes.inven.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidenciaDTO {
    private Long incidenciaId;
    private String title;
    private String description;
    private String priority;
    private String status;
    private String previousProductStatus;
    private Integer productId;
    private String productName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
