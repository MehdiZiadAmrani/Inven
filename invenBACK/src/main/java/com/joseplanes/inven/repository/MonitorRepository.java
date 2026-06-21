package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Monitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MonitorRepository extends JpaRepository<Monitor, Integer> {
    List<Monitor> findByBrand(String brand);
    List<Monitor> findByStockQuantityGreaterThan(int quantity);
}
