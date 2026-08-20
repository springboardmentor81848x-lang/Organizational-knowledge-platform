package com.team7.knowledge_gap_platform.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.TrainingMilestone;
import com.team7.knowledge_gap_platform.repository.TrainingMilestoneRepository;

@Service
public class TrainingMilestoneService {

    private final TrainingMilestoneRepository repository;

    public TrainingMilestoneService(
            TrainingMilestoneRepository repository) {
        this.repository = repository;
    }

    public TrainingMilestone createMilestone(
            TrainingMilestone milestone) {

        if (milestone.getTargetPercentage() == null
                || milestone.getTargetPercentage() < 0
                || milestone.getTargetPercentage() > 100) {
            throw new RuntimeException(
                    "Target percentage must be between 0 and 100");
        }

        return repository.save(milestone);
    }

    public List<TrainingMilestone> getByTraining(
            Long trainingId) {

        return repository.findByTrainingId(trainingId);
    }

    public TrainingMilestone getById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Training milestone not found"));
    }

    public void deleteMilestone(Long id) {

        TrainingMilestone milestone = getById(id);

        repository.delete(milestone);
    }
}