package com.okip.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.assessment.AssessmentReviewRequestDTO;
import com.okip.dto.assessment.SkillAssessmentRequestDTO;
import com.okip.dto.assessment.SkillAssessmentResponseDTO;
import com.okip.service.assessment.SkillAssessmentService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/assessments")
@Validated
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR','ADMIN')")
public class SkillAssessmentController {

    private final SkillAssessmentService assessmentService;

    public SkillAssessmentController(SkillAssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping
    public ResponseEntity<SkillAssessmentResponseDTO> submitAssessment(
            @Valid @RequestBody SkillAssessmentRequestDTO request) {
        return new ResponseEntity<>(assessmentService.submitAssessment(request), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<SkillAssessmentResponseDTO>> getMyAssessments() {
        return ResponseEntity.ok(assessmentService.getMyAssessments());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<List<SkillAssessmentResponseDTO>> getPendingReviews() {
        return ResponseEntity.ok(assessmentService.getPendingReviews());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<List<SkillAssessmentResponseDTO>> getEmployeeAssessments(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(assessmentService.getEmployeeAssessments(employeeId));
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<SkillAssessmentResponseDTO> getAssessmentById(
            @PathVariable Long assessmentId) {
        return ResponseEntity.ok(assessmentService.getAssessmentById(assessmentId));
    }

    @PutMapping("/{assessmentId}/review")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<SkillAssessmentResponseDTO> reviewAssessment(
            @PathVariable Long assessmentId,
            @Valid @RequestBody AssessmentReviewRequestDTO reviewRequest) {
        return ResponseEntity.ok(assessmentService.reviewAssessment(assessmentId, reviewRequest));
    }
}
