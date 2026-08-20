package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.TrainingMilestone;
import com.team7.knowledge_gap_platform.service.TrainingMilestoneService;

@RestController
@RequestMapping("/training-milestones")
public class TrainingMilestoneController {

    private final TrainingMilestoneService service;

    public TrainingMilestoneController(
            TrainingMilestoneService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TrainingMilestone> create(
            @RequestBody TrainingMilestone milestone) {

        return ResponseEntity.ok(
                service.createMilestone(milestone));
    }

    @GetMapping("/training/{trainingId}")
    public ResponseEntity<List<TrainingMilestone>> getByTraining(
            @PathVariable Long trainingId) {

        return ResponseEntity.ok(
                service.getByTraining(trainingId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingMilestone> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Long id) {

        service.deleteMilestone(id);

        return ResponseEntity.ok(
                "Training milestone deleted successfully");
    }
}