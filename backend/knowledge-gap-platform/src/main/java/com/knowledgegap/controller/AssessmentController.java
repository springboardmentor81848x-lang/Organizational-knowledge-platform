package com.knowledgegap.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.service.AssessmentService;

@RestController
@RequestMapping("/api/employee/assessment")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(
            AssessmentService assessmentService) {

        this.assessmentService = assessmentService;
    }


    /*
     * Get active assessment questions.
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentAssessment() {

        return ResponseEntity.ok(
                assessmentService.getCurrentAssessment()
        );
    }


    /*
     * Submit assessment.
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitAssessment(
            Authentication authentication,
            @RequestBody Map<String, Object> request) {

        String email = authentication.getName();

        Long assessmentId =
                Long.valueOf(
                        request.get("assessmentId").toString()
                );

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answers =
                (List<Map<String, Object>>)
                        request.get("answers");

        return ResponseEntity.ok(
                assessmentService.submitAssessment(
                        email,
                        assessmentId,
                        answers
                )
        );
    }


    /*
     * Get latest result.
     */
    @GetMapping("/result")
    public ResponseEntity<?> getLatestResult(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                assessmentService.getLatestResult(email)
        );
    }


    /*
     * Get previous attempts.
     */
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                assessmentService.getAssessmentHistory(email)
        );
    }
}
