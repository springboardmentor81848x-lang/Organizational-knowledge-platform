package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.TrainingMilestone;

public interface TrainingMilestoneRepository
        extends JpaRepository<TrainingMilestone, Long> {

    List<TrainingMilestone> findByTrainingId(Long trainingId);
}