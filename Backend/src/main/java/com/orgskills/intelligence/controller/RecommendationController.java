package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.recommendation.RankedRecommendationResponse;
import com.orgskills.intelligence.dto.recommendation.RecommendationResponse;
import com.orgskills.intelligence.service.RecommendationScoringService;
import com.orgskills.intelligence.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final RecommendationScoringService recommendationScoringService;

    /**
     * Generates fresh AI-powered training recommendations from the employee's
     * current knowledge gaps. Deletes any previously stored recommendations
     * before saving the new set.
     */
    @PostMapping("/{employeeId}")
    public ResponseEntity<List<RecommendationResponse>> generate(@PathVariable Long employeeId) {
        return ResponseEntity.ok(recommendationService.generateRecommendations(employeeId));
    }

    /**
     * Returns the most recently generated training recommendations for the
     * given employee, ordered by priority rank (highest priority first).
     */
    @GetMapping("/{employeeId}")
    public ResponseEntity<List<RecommendationResponse>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(recommendationService.getByEmployee(employeeId));
    }

    /**
     * Returns the full, unified ranked list of course recommendation scores
     * for the given employee, complete with score breakdowns for transparency.
     */
    @GetMapping("/{employeeId}/ranked")
    public ResponseEntity<List<RankedRecommendationResponse>> getRankedRecommendations(@PathVariable Long employeeId) {
        return ResponseEntity.ok(recommendationScoringService.rankedRecommendationsFor(employeeId));
    }
}
