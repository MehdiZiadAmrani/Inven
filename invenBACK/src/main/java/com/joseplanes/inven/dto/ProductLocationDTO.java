package com.joseplanes.inven.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductLocationDTO {
    private Integer locationId;
    private Integer productId;

    @NotBlank(message = "Location name is required")
    private String locationName;

    @Pattern(regexp = "^(office|server_room|repair|warehouse|other)$", message = "Location type must be one of: office, server_room, repair, warehouse, other")
    private String locationType;

    private String assignedTo;
    private LocalDateTime movedAt;
    private String movedBy;
    private String notes;
    private Boolean isCurrent;
}
