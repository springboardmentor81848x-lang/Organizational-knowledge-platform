package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultResponse;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SkillProgressionResponse;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Assessments. Employees assess themselves and read their own history; assessing or reading
 * somebody else requires a manager, HR or L&amp;D role, which the service checks so the rule
 * stays in one place.
 */
@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AssessmentController {

    private final AssessmentService assessmentService;

    @PostMapping
    public ResponseEntity<AssessmentResponse> createAssessment(
            Authentication authentication,
            @Valid @RequestBody CreateAssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assessmentService.createAssessment(getUserId(authentication), request));
    }

    /**
     * Submits results and runs the whole chain — skill levels, improvement, gap recalculation,
     * recommendations and notification — in a single transaction.
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<AssessmentResponse> submitAssessment(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SubmitAssessmentRequest request) {
        return ResponseEntity.ok(assessmentService.submitAssessment(getUserId(authentication), id, request));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<List<AssessmentResultResponse>> getResults(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(assessmentService.getResults(getUserId(authentication), id));
    }

    @GetMapping
    public ResponseEntity<List<AssessmentResponse>> getAssessments(
            Authentication authentication,
            @RequestParam(required = false) Long employeeId) {
        return ResponseEntity.ok(assessmentService.getAssessments(getUserId(authentication), employeeId));
    }

    @GetMapping("/history/{employeeId}")
    public ResponseEntity<List<SkillProgressionResponse>> getHistory(
            Authentication authentication,
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(assessmentService.getHistory(getUserId(authentication), employeeId));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
