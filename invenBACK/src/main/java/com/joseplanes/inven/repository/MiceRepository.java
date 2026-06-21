package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Mice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MiceRepository extends JpaRepository<Mice, Integer> {
    List<Mice> findByBrand(String brand);
    List<Mice> findByWireless(Boolean wireless);
    List<Mice> findByStockQuantityGreaterThan(int quantity);
}
