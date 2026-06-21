package com.joseplanes.inven.repository;

import com.joseplanes.inven.model.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {
    List<Incidencia> findByStatus(String status);
    List<Incidencia> findByPriority(String priority);
    List<Incidencia> findByProductProductId(Long productId);
    List<Incidencia> findByStatusAndPriority(String status, String priority);
    List<Incidencia> findByProductProductIdAndStatus(Long productId, String status);
}
