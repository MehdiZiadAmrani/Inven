package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    boolean existsByNameIgnoreCase(String name);
    Optional<Location> findByNameIgnoreCase(String name);
    List<Location> findByStatusNot(String status);
    List<Location> findByTypeAndStatusNot(String type, String status);
}
