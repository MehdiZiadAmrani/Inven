package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Keyboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface KeyboardRepository extends JpaRepository<Keyboard, Integer> {
    List<Keyboard> findByBrand(String brand);
    List<Keyboard> findByLayout(String layout);
    List<Keyboard> findByStockQuantityGreaterThan(int quantity);
}
