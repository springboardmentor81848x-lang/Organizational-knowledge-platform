package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.employee.CertificationResponse;
import com.orgskills.intelligence.dto.hr.TrainingEffectivenessResponse;
import com.orgskills.intelligence.dto.ld.CourseParticipationResponse;
import com.orgskills.intelligence.dto.ld.CourseRequest;
import com.orgskills.intelligence.dto.ld.CourseResponse;
import com.orgskills.intelligence.dto.ld.LearningPathRequest;
import com.orgskills.intelligence.dto.ld.LearningPathResponse;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.LndAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ld-admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('LND_ADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
public class LndAdminController {

    private final LndAdminService lndAdminService;

    // ── Courses Catalog ─────────────────────────────────────────────────────────

    @GetMapping("/courses")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(lndAdminService.getAllCourses());
    }

    @PostMapping("/courses")
    public ResponseEntity<CourseResponse> createCourse(
            Authentication authentication,
            @Valid @RequestBody CourseRequest request) {
        Long actorId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(lndAdminService.createCourse(actorId, request));
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable Long id) {
        return ResponseEntity.ok(lndAdminService.getCourse(id));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<CourseResponse> updateCourse(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody CourseRequest request) {
        Long actorId = getUserId(authentication);
        return ResponseEntity.ok(lndAdminService.updateCourse(actorId, id, request));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(
            Authentication authentication,
            @PathVariable Long id) {
        Long actorId = getUserId(authentication);
        lndAdminService.deleteCourse(actorId, id);
        return ResponseEntity.noContent().build();
    }

    // ── Learning Paths ──────────────────────────────────────────────────────────

    @GetMapping("/learning-paths")
    public ResponseEntity<List<LearningPathResponse>> getAllLearningPaths() {
        return ResponseEntity.ok(lndAdminService.getAllLearningPaths());
    }

    @PostMapping("/learning-paths")
    public ResponseEntity<LearningPathResponse> createLearningPath(
            Authentication authentication,
            @Valid @RequestBody LearningPathRequest request) {
        Long actorId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(lndAdminService.createLearningPath(actorId, request));
    }

    @GetMapping("/learning-paths/{id}")
    public ResponseEntity<LearningPathResponse> getLearningPath(@PathVariable Long id) {
        return ResponseEntity.ok(lndAdminService.getLearningPath(id));
    }

    @PutMapping("/learning-paths/{id}")
    public ResponseEntity<LearningPathResponse> updateLearningPath(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody LearningPathRequest request) {
        Long actorId = getUserId(authentication);
        return ResponseEntity.ok(lndAdminService.updateLearningPath(actorId, id, request));
    }

    @DeleteMapping("/learning-paths/{id}")
    public ResponseEntity<Void> deleteLearningPath(
            Authentication authentication,
            @PathVariable Long id) {
        Long actorId = getUserId(authentication);
        lndAdminService.deleteLearningPath(actorId, id);
        return ResponseEntity.noContent().build();
    }

    // ── Metrics & Reminders ─────────────────────────────────────────────────────

    @GetMapping("/courses/{id}/participation")
    public ResponseEntity<CourseParticipationResponse> getCourseParticipation(@PathVariable Long id) {
        return ResponseEntity.ok(lndAdminService.getCourseParticipation(id));
    }

    @GetMapping("/courses/{id}/effectiveness")
    public ResponseEntity<TrainingEffectivenessResponse> getCourseEffectiveness(@PathVariable Long id) {
        return ResponseEntity.ok(lndAdminService.getCourseEffectiveness(id));
    }

    @GetMapping("/certifications/expiring")
    public ResponseEntity<List<CertificationResponse>> getExpiringCertifications() {
        return ResponseEntity.ok(lndAdminService.getExpiringCertifications());
    }

    @PostMapping("/certifications/{id}/remind")
    public ResponseEntity<Void> remindCertification(
            Authentication authentication,
            @PathVariable Long id) {
        Long actorId = getUserId(authentication);
        lndAdminService.sendCertificationReminder(actorId, id);
        return ResponseEntity.ok().build();
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        return 1L;
    }
}
