package com.okip.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.ai.AiRecommendationResponseDTO;
import com.okip.service.ai.AiRecommendationService;

@RestController
@RequestMapping("/api/ai")
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    public AiRecommendationController(
            AiRecommendationService aiRecommendationService) {

        this.aiRecommendationService =
                aiRecommendationService;
    }

    @PostMapping("/recommendation/{employeeId}")
    public ResponseEntity<AiRecommendationResponseDTO>
            generateRecommendation(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                aiRecommendationService
                        .generateRecommendation(employeeId));
    }

    @GetMapping("/learning-path")
    public String getRoleLearningPath(
            @RequestParam String role) {

        return aiRecommendationService
                .generateRoleLearningPath(role);
    }
}