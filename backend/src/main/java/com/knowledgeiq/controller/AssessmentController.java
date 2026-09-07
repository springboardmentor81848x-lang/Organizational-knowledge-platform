package com.knowledgeiq.controller;

import com.knowledgeiq.dto.*;
import com.knowledgeiq.service.AssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    @Autowired
    private AssessmentService assessmentService;

    private String getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Unauthorized");
        }
        return (String) authentication.getPrincipal();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyAssessments() {
        try {
            String userId = getAuthenticatedUserId();
            List<AssessmentDto> assessments = assessmentService.getUserAssessments(userId);
            return ResponseEntity.ok(assessments);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @GetMapping("/questionnaire")
    public ResponseEntity<?> getQuestionnaire() {
        try {
            String userId = getAuthenticatedUserId();
            AssessmentQuestionnaireDto questionnaire = assessmentService.getQuestionnaireForUser(userId);
            return ResponseEntity.ok(questionnaire);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitAssessment(@RequestBody AssessmentSubmissionDto dto) {
        try {
            String userId = getAuthenticatedUserId();
            AssessmentDto result = assessmentService.submitAssessment(userId, dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PostMapping("/request-peer")
    public ResponseEntity<?> requestPeerAssessment(@RequestBody PeerRequestDto dto) {
        try {
            String userId = getAuthenticatedUserId();
            AssessmentDto result = assessmentService.requestPeerAssessment(userId, dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/pending-evaluations")
    public ResponseEntity<?> getPendingEvaluations() {
        try {
            String userId = getAuthenticatedUserId();
            List<AssessmentDto> pending = assessmentService.getPendingEvaluationsForUser(userId);
            return ResponseEntity.ok(pending);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/custom-builder")
    public ResponseEntity<?> createCustomQuestionnaire(@RequestBody CustomQuestionnaireDto dto) {
        try {
            String userId = getAuthenticatedUserId();
            CustomQuestionnaireDto result = assessmentService.createCustomQuestionnaire(userId, dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/custom-questionnaires")
    public ResponseEntity<?> getCustomQuestionnaires() {
        try {
            List<CustomQuestionnaireDto> list = assessmentService.getCustomQuestionnaires();
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleAssessment(@RequestBody ScheduleAssessmentDto dto) {
        try {
            String userId = getAuthenticatedUserId();
            AssessmentDto result = assessmentService.scheduleAssessment(userId, dto);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/compare")
    public ResponseEntity<?> compareAssessments(@RequestParam("id1") String id1, @RequestParam("id2") String id2) {
        try {
            AssessmentComparisonDto result = assessmentService.compareHistoricalAssessments(id1, id2);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<?> getAssessmentResults(@PathVariable("id") java.util.UUID id) {
        try {
            return ResponseEntity.ok(assessmentService.getAssessmentResults(id));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }
}
