package com.knowledgegap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.dto.AssessmentSubmitRequest;
import com.knowledgegap.dto.AssessmentSubmitResponse;
import com.knowledgegap.dto.EmployeeAssessmentResponse;
import com.knowledgegap.service.AssessmentEvaluationService;

@RestController
@RequestMapping("/api/assessment-evaluation")
@CrossOrigin(origins = "*")
public class AssessmentEvaluationController {

    private final AssessmentEvaluationService assessmentEvaluationService;

    public AssessmentEvaluationController(
            AssessmentEvaluationService assessmentEvaluationService) {

        this.assessmentEvaluationService =
                assessmentEvaluationService;
    }

    // ============================================================
    // GET ROLE-SPECIFIC ASSESSMENT FOR EMPLOYEE
    // ============================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<EmployeeAssessmentResponse>
            getAssessmentForEmployee(
                    @PathVariable Long employeeId) {

        EmployeeAssessmentResponse response =
                assessmentEvaluationService
                        .getAssessmentForEmployee(employeeId);

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // SUBMIT ASSESSMENT
    // ============================================================

    @PostMapping("/submit")
    public ResponseEntity<AssessmentSubmitResponse>
            submitAssessment(
                    @RequestBody AssessmentSubmitRequest request) {

        AssessmentSubmitResponse response =
                assessmentEvaluationService
                        .submitAssessment(request);

        return ResponseEntity.ok(response);
    }
}