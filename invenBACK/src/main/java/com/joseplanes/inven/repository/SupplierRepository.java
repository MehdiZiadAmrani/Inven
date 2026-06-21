package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    Optional<Supplier> findByContactEmail(String contactEmail);
    boolean existsByContactEmail(String contactEmail);
}
