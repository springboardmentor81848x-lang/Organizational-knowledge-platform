package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.TrainingProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Training enrolments and learning progress. Any authenticated employee manages their own
 * enrolments; acting on somebody else's requires a manager or L&amp;D role, which the service
 * checks so the rule stays in one place.
 */
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class TrainingProgressController {

    private final TrainingProgressService trainingProgressService;

    @PostMapping
    public ResponseEntity<EnrollmentResponse> enroll(
            Authentication authentication,
            @Valid @RequestBody EnrollmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(trainingProgressService.enroll(getUserId(authentication), request));
    }

    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getEnrollments(
            Authentication authentication,
            @RequestParam(required = false) Long employeeId) {
        return ResponseEntity.ok(trainingProgressService.getEnrollments(getUserId(authentication), employeeId));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<EnrollmentResponse> updateProgress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgressRequest request) {
        return ResponseEntity.ok(trainingProgressService.updateProgress(getUserId(authentication), id, request));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<EnrollmentResponse> complete(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(trainingProgressService.complete(getUserId(authentication), id));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
