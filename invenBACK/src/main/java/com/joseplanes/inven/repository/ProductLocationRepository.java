package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.ProductLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductLocationRepository extends JpaRepository<ProductLocation, Integer> {

    List<ProductLocation> findByProductProductIdOrderByMovedAtDesc(Integer productId);

    List<ProductLocation> findByProductProductIdAndIsCurrentTrue(Integer productId);

    @Modifying
    @Query("UPDATE ProductLocation pl SET pl.isCurrent = false WHERE pl.product.productId = :productId")
    void markAllAsNotCurrent(@Param("productId") Integer productId);

    void deleteByProductProductId(Integer productId);
}
