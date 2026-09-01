package com.knowledgegap.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.service.TrainingEffectivenessService;

@RestController
@RequestMapping("/api/hr/training-effectiveness")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainingEffectivenessController {

    private final TrainingEffectivenessService trainingEffectivenessService;

    public TrainingEffectivenessController(TrainingEffectivenessService trainingEffectivenessService) {
        this.trainingEffectivenessService = trainingEffectivenessService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(trainingEffectivenessService.getSummary());
    }

    @GetMapping("/trainings")
    public ResponseEntity<List<Map<String, Object>>> getTrainingPerformance() {
        return ResponseEntity.ok(trainingEffectivenessService.getTrainingPerformance());
    }

    @GetMapping("/skill-improvement")
    public ResponseEntity<Map<String, Object>> getSkillImprovement() {
        return ResponseEntity.ok(trainingEffectivenessService.getSkillImprovement());
    }

    @GetMapping("/gap-reduction")
    public ResponseEntity<Map<String, Object>> getGapReduction() {
        return ResponseEntity.ok(trainingEffectivenessService.getGapReduction());
    }

    @GetMapping("/attention")
    public ResponseEntity<List<Map<String, Object>>> getAttention() {
        return ResponseEntity.ok(trainingEffectivenessService.getAttentionList());
    }
}
