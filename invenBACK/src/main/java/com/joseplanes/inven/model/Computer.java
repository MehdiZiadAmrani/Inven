package com.joseplanes.inven.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "computers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Computer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "computer_id")
    private Integer computerId;

    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "type", length = 20)
    private String type;

    @Column(name = "cpu", length = 80)
    private String cpu;

    @Column(name = "ram_gb")
    private Integer ramGb;

    @Column(name = "storage_gb")
    private Integer storageGb;

    @Column(name = "storage_type", length = 10)
    private String storageType;

    @Column(name = "os", length = 40)
    private String os;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "inventory_code", length = 50)
    private String inventoryCode;

    @Column(name = "registered_at")
    private java.time.LocalDateTime registeredAt;

    @Column(name = "deactivated_at")
    private java.time.LocalDateTime deactivatedAt;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "available";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_type_id",
            foreignKey = @ForeignKey(
                    value = ConstraintMode.CONSTRAINT,
                    name = "fk_computer_item_type",
                    foreignKeyDefinition = "FOREIGN KEY (item_type_id) REFERENCES item_types(item_type_id) ON DELETE SET NULL"))
    private ItemType itemType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "stock_quantity", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal unitPrice;
}
