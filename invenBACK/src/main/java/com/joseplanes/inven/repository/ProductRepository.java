package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByStatus(String status);
    List<Product> findByStatusNot(String status);
    List<Product> findByBundleNameContainingIgnoreCase(String name);
}
