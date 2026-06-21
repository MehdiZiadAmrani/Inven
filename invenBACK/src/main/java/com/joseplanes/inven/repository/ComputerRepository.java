package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Computer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComputerRepository extends JpaRepository<Computer, Integer> {
    List<Computer> findByBrand(String brand);
    List<Computer> findByType(String type);
    List<Computer> findByStockQuantityGreaterThan(int quantity);
}
