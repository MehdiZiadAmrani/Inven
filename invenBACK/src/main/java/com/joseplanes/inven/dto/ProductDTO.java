package com.joseplanes.inven.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductDTO {
    private Integer productId;

    @NotBlank(message = "Bundle name is required")
    private String bundleName;

    private Integer monitorId;
    private String monitorModel;
    private Integer mouseId;
    private String mouseModel;
    private Integer keyboardId;
    private String keyboardModel;
    private Integer computerId;
    private String computerModel;

    @Pattern(regexp = "^(available|assigned|maintenance|disabled)$", message = "Status must be one of: available, assigned, maintenance, disabled")
    private String status;

    private LocalDateTime createdAt;
}
