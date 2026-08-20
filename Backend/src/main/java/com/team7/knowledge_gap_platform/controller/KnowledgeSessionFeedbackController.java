package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.KnowledgeSessionFeedback;
import com.team7.knowledge_gap_platform.service.KnowledgeSessionFeedbackService;

@RestController
@RequestMapping("/knowledge-session-feedback")
public class KnowledgeSessionFeedbackController {

    private final KnowledgeSessionFeedbackService service;

    public KnowledgeSessionFeedbackController(
            KnowledgeSessionFeedbackService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<KnowledgeSessionFeedback> addFeedback(
            @RequestBody KnowledgeSessionFeedback feedback) {

        return ResponseEntity.ok(
                service.addFeedback(feedback));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<KnowledgeSessionFeedback>> getBySession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                service.getBySession(sessionId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<KnowledgeSessionFeedback>> getByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                service.getByEmployee(employeeId));
    }

    @GetMapping("/session/{sessionId}/average-rating")
    public ResponseEntity<Map<String, Double>> getAverageRating(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                Map.of(
                        "averageRating",
                        service.getAverageRating(sessionId)
                ));
    }
}