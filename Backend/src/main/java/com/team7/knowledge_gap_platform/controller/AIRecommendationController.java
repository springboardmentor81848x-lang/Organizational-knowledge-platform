package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.AIRecommendation;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;
import com.team7.knowledge_gap_platform.service.AIRecommendationService;
import com.team7.knowledge_gap_platform.service.HuggingFaceService;

@RestController
@RequestMapping("/ai-recommendations")
public class AIRecommendationController {

    private final AIRecommendationService aiRecommendationService;
    private final HuggingFaceService huggingFaceService;
    private final SkillGapRepository skillGapRepository;

    public AIRecommendationController(
            AIRecommendationService aiRecommendationService,
            HuggingFaceService huggingFaceService,
            SkillGapRepository skillGapRepository) {

        this.aiRecommendationService = aiRecommendationService;
        this.huggingFaceService = huggingFaceService;
        this.skillGapRepository = skillGapRepository;
    }

    @PostMapping("/generate/{employeeId}")
    public ResponseEntity<List<AIRecommendation>> generateRecommendations(
            @PathVariable Long employeeId) {

        List<SkillGap> gaps =
                skillGapRepository.findByEmployeeId(employeeId);

        List<AIRecommendation> recommendations =
                gaps.stream()
                        .filter(gap -> gap.getGapScore() != null
                                && gap.getGapScore() > 0)
                        .map(gap -> {

                            String prompt =
                                    "You are a professional learning advisor. "
                                    + "Give a short personalized training recommendation. "
                                    + "Employee ID: " + employeeId
                                    + ", Skill ID: " + gap.getSkillId()
                                    + ", Current proficiency: "
                                    + gap.getCurrentProficiency()
                                    + ", Required proficiency: "
                                    + gap.getRequiredProficiency()
                                    + ", Gap level: "
                                    + gap.getGapLevel()
                                    + ". Recommend what the employee should learn "
                                    + "and give 3 practical learning steps.";

                            String recommendation =
                                    huggingFaceService
                                            .generateRecommendation(prompt);

                            return aiRecommendationService
                                    .saveRecommendation(
                                            employeeId,
                                            gap.getSkillId(),
                                            gap.getGapLevel(),
                                            recommendation,
                                            "HuggingFace LLM"
                                    );
                        })
                        .toList();

        return ResponseEntity.ok(recommendations);
    }

    @GetMapping
    public ResponseEntity<List<AIRecommendation>>
            getAllRecommendations() {

        return ResponseEntity.ok(
                aiRecommendationService.getAllRecommendations()
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AIRecommendation>>
            getRecommendationsByEmployee(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                aiRecommendationService
                        .getRecommendationsByEmployee(employeeId)
        );
    }
}