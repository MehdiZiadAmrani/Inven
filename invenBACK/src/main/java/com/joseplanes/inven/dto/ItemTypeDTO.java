package com.joseplanes.inven.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemTypeDTO {
    private Integer itemTypeId;
    private String name;
    private String status;
    private LocalDateTime createdAt;
}
