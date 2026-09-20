package com.okip.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.okip.entity.master.TrainingResource;

public interface TrainingResourceRepository extends JpaRepository<TrainingResource, Long> {
    List<TrainingResource> findByModuleModuleIdOrderByResourceOrderAsc(Long moduleId);
    Optional<TrainingResource> findByModuleModuleIdAndResourceOrder(Long moduleId, Integer resourceOrder);
}
