package com.okip.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Training;

public interface TrainingRepository
        extends JpaRepository<Training, Long> {

    Optional<Training> findByTrainingNameIgnoreCase(
            String trainingName);

                boolean existsByTrainingNameIgnoreCase(
            String trainingName);
            
 boolean existsByTrainingNameIgnoreCaseAndTrainingIdNot(
        String trainingName,
        Long trainingId);
}