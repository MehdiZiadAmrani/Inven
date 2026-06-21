package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ItemTypeRepository extends JpaRepository<ItemType, Integer> {
    boolean existsByNameIgnoreCase(String name);
    Optional<ItemType> findByNameIgnoreCase(String name);
}
