package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByStatusNot(String status);
    Optional<Brand> findByNameIgnoreCase(String name);
}
