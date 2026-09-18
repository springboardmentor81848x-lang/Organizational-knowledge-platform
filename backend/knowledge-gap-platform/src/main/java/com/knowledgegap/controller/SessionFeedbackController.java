package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.SessionFeedback;
import com.knowledgegap.service.SessionFeedbackService;

@RestController
@RequestMapping("/api/session-feedback")
@CrossOrigin(origins = "http://localhost:5173")
public class SessionFeedbackController {

    private final SessionFeedbackService feedbackService;

    public SessionFeedbackController(
            SessionFeedbackService feedbackService) {

        this.feedbackService = feedbackService;
    }

    // Submit feedback and rating
    @PostMapping("/session/{sessionId}/employee/{employeeId}")
    public ResponseEntity<SessionFeedback> submitFeedback(
            @PathVariable Long sessionId,
            @PathVariable Long employeeId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String comments) {

        SessionFeedback feedback =
                feedbackService.submitFeedback(
                        sessionId,
                        employeeId,
                        rating,
                        comments);

        return new ResponseEntity<>(
                feedback,
                HttpStatus.CREATED);
    }

    // View all feedback for a session
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SessionFeedback>> getFeedbackBySession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                feedbackService
                        .getFeedbackBySession(sessionId));
    }

    // View feedback submitted by an employee
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<SessionFeedback>> getFeedbackByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                feedbackService
                        .getFeedbackByEmployee(employeeId));
    }

    // Calculate session effectiveness
    @GetMapping("/session/{sessionId}/effectiveness")
    public ResponseEntity<Double> getSessionEffectiveness(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                feedbackService
                        .getSessionEffectiveness(sessionId));
    }

    // Get one feedback record
    @GetMapping("/{feedbackId}")
    public ResponseEntity<SessionFeedback> getFeedbackById(
            @PathVariable Long feedbackId) {

        return ResponseEntity.ok(
                feedbackService
                        .getFeedbackById(feedbackId));
    }
}