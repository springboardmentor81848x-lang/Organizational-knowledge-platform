package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.dto.AssessmentResultResponse;
import com.knowledgegap.dto.AssessmentSubmitRequest;
import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.AssessmentQuestion;
import com.knowledgegap.service.AssessmentService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(
            AssessmentService assessmentService) {

        this.assessmentService = assessmentService;
    }

    // =========================================================
    // ACTIVE ASSESSMENTS
    // =========================================================

    @GetMapping("/assessments/active")
    public ResponseEntity<List<Assessment>>
    getActiveAssessments() {

        return ResponseEntity.ok(
                assessmentService.getActiveAssessments()
        );
    }

    // =========================================================
    // ASSESSMENT BY ID
    // =========================================================

    @GetMapping("/assessments/{id}")
    public ResponseEntity<Assessment>
    getAssessment(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentById(id)
        );
    }

    // =========================================================
    // ASSESSMENT BY TARGET ROLE
    // =========================================================
    //
    // Frontend calls:
    //
    // GET /api/assessments/role/{roleId}
    //
    // Example:
    // GET /api/assessments/role/2
    //
    // =========================================================

    @GetMapping("/assessments/role/{roleId}")
    public ResponseEntity<Assessment>
    getAssessmentByRoleId(
            @PathVariable Long roleId) {

        return ResponseEntity.ok(
                assessmentService.getAssessmentByRoleId(roleId)
        );
    }

    // =========================================================
    // QUESTIONS
    // =========================================================

    @GetMapping("/assessments/{assessmentId}/questions")
    public ResponseEntity<List<AssessmentQuestion>>
    getQuestions(
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
    //
    // Kept for backward compatibility.
    //
    // Frontend should use:
    // /employee/assessment/submit/{employeeIdentifier}
    //
    // =========================================================

    @PostMapping("/employee/assessment/submit")
    public ResponseEntity<AssessmentResultResponse>
    submitAssessment(
            @RequestBody AssessmentSubmitRequest request) {

        throw new UnsupportedOperationException(
                "Use /employee/assessment/submit/{employeeIdentifier}"
        );
    }

    // =========================================================
    // SUBMIT WITH EMPLOYEE IDENTIFIER
    // =========================================================

    @PostMapping(
            "/employee/assessment/submit/{employeeIdentifier}"
    )
    public ResponseEntity<AssessmentResultResponse>
    submitAssessment(
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
            "/employee/assessment/result/{attemptId}"
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