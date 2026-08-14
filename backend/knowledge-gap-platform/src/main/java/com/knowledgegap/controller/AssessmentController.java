package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.dto.AssessmentResultResponse;
import com.knowledgegap.dto.AssessmentSubmitRequest;
import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.AssessmentQuestion;
import com.knowledgegap.service.AssessmentService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(
            AssessmentService assessmentService) {

        this.assessmentService = assessmentService;
    }

    // =========================================================
    // GET ACTIVE ASSESSMENTS
    // =========================================================

    @GetMapping("/assessments/active")
    public ResponseEntity<List<Assessment>> getActiveAssessments() {

        return ResponseEntity.ok(
                assessmentService.getActiveAssessments()
        );
    }

    // =========================================================
    // GET ASSESSMENT BY ID
    // =========================================================

    @GetMapping("/assessments/{id}")
    public ResponseEntity<Assessment> getAssessment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentById(id)
        );
    }

    // =========================================================
    // GET ASSESSMENT BY TARGET ROLE
    // =========================================================

    @GetMapping("/assessments/role/{roleId}")
    public ResponseEntity<Assessment> getAssessmentByRole(
            @PathVariable Long roleId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentByTargetRole(roleId)
        );
    }

    // =========================================================
    // GET QUESTIONS BY ASSESSMENT
    // =========================================================

    @GetMapping("/assessments/{assessmentId}/questions")
    public ResponseEntity<List<AssessmentQuestion>> getQuestions(
            @PathVariable Long assessmentId) {

        return ResponseEntity.ok(
                assessmentService.getQuestionsByAssessment(
                        assessmentId
                )
        );
    }

    // =========================================================
    // SUBMIT ASSESSMENT
    // =========================================================

    @PostMapping(
            "/employee/assessment/submit/{employeeIdentifier}"
    )
    public ResponseEntity<AssessmentResultResponse> submitAssessment(
            @PathVariable String employeeIdentifier,
            @RequestBody AssessmentSubmitRequest request) {

        AssessmentResultResponse result =
                assessmentService.submitAssessment(
                        request,
                        employeeIdentifier
                );

        return ResponseEntity.ok(result);
    }

    // =========================================================
    // GET ASSESSMENT GAP RESULTS
    // =========================================================

    @GetMapping(
            "/employee/assessment/gaps/{attemptId}"
    )
    public ResponseEntity<List<AssessmentGapResult>>
    getAssessmentGapResults(
            @PathVariable Long attemptId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentGapResults(
                        attemptId
                )
        );
    }
}