package com.knowledgegap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.dto.LearningAnalytics;
import com.knowledgegap.service.LearningAnalyticsService;

@RestController
@RequestMapping("/api/learning-analytics")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class LearningAnalyticsController {

    private final LearningAnalyticsService analyticsService;

    public LearningAnalyticsController(
            LearningAnalyticsService analyticsService) {

        this.analyticsService = analyticsService;
    }

    // =========================================================
    // GET MENTOR LEARNING ANALYTICS
    // =========================================================

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<LearningAnalytics>
    getMentorAnalytics(
            @PathVariable Long mentorId) {

        LearningAnalytics analytics =
                analyticsService.getMentorAnalytics(
                        mentorId);

        return ResponseEntity.ok(analytics);
    }

    // =========================================================
    // GET SESSION EFFECTIVENESS
    // =========================================================

    @GetMapping("/session/{sessionId}/effectiveness")
    public ResponseEntity<Double>
    getSessionEffectiveness(
            @PathVariable Long sessionId) {

        Double effectiveness =
                analyticsService
                        .getSessionEffectiveness(
                                sessionId);

        return ResponseEntity.ok(effectiveness);
    }
}