package com.okip.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.okip.entity.master.TrainingModule;

public interface TrainingModuleRepository extends JpaRepository<TrainingModule, Long> {
    List<TrainingModule> findByTrainingTrainingIdOrderByModuleOrderAsc(Long trainingId);
    Optional<TrainingModule> findByTrainingTrainingIdAndModuleOrder(Long trainingId, Integer moduleOrder);
}
