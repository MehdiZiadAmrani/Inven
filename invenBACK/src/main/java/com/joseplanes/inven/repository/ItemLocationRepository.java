package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.ItemLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ItemLocationRepository extends JpaRepository<ItemLocation, Long> {
    Optional<ItemLocation> findByItemTypeAndItemId(String itemType, Integer itemId);
    void deleteByItemTypeAndItemId(String itemType, Integer itemId);
}