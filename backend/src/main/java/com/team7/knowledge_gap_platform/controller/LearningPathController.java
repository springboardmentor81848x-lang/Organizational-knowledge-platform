package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.LearningPath;
import com.team7.knowledge_gap_platform.service.LearningPathService;

@RestController
@RequestMapping("/learning-paths")
public class LearningPathController {

    private final LearningPathService learningPathService;

    public LearningPathController(
            LearningPathService learningPathService) {
        this.learningPathService = learningPathService;
    }

    @PostMapping("/generate/{employeeId}")
    public ResponseEntity<List<LearningPath>> generateLearningPath(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                learningPathService.generateLearningPath(employeeId)
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LearningPath>> getLearningPathByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                learningPathService
                        .getLearningPathByEmployee(employeeId)
        );
    }

    @GetMapping("/employee/{employeeId}/skill/{skillId}")
    public ResponseEntity<List<LearningPath>>
            getLearningPathByEmployeeAndSkill(
                    @PathVariable Long employeeId,
                    @PathVariable Long skillId) {

        return ResponseEntity.ok(
                learningPathService
                        .getLearningPathByEmployeeAndSkill(
                                employeeId,
                                skillId)
        );
    }
}