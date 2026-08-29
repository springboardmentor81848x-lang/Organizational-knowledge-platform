package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.employee.AchievementResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.dto.employee.CertificationRequest;
import com.orgskills.intelligence.dto.employee.CertificationResponse;
import com.orgskills.intelligence.dto.employee.EmployeeProfileRequest;
import com.orgskills.intelligence.dto.employee.EmployeeProfileResponse;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.dto.mentorship.RecommendedMentorResponse;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.ld.LearningPathResponse;
import com.orgskills.intelligence.dto.notification.NotificationResponse;
import com.orgskills.intelligence.dto.recommendation.RecommendationResponse;
import com.orgskills.intelligence.dto.skill.UserSkillResponse;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.EmployeeService;
import com.orgskills.intelligence.service.GapAnalysisService;
import com.orgskills.intelligence.service.LndAdminService;
import com.orgskills.intelligence.service.NotificationService;
import com.orgskills.intelligence.service.RecommendationService;
import com.orgskills.intelligence.service.UserSkillService;
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

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'DEPARTMENT_HEAD', 'HR_SPECIALIST', 'HR_ADMIN', 'LND_ADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final UserSkillService userSkillService;
    private final GapAnalysisService gapAnalysisService;
    private final RecommendationService recommendationService;
    private final NotificationService notificationService;
    private final LndAdminService lndAdminService;

    @GetMapping("/profile")
    public ResponseEntity<EmployeeProfileResponse> getProfile(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.getProfile(userId));
    }

    @PutMapping("/profile")
    public ResponseEntity<EmployeeProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody EmployeeProfileRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.updateProfile(userId, request));
    }

    @GetMapping("/skills")
    public ResponseEntity<List<UserSkillResponse>> getSkills(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(userSkillService.getUserSkills(userId));
    }

    @PostMapping("/assessments/self")
    public ResponseEntity<AssessmentResponse> submitSelfAssessment(
            Authentication authentication,
            @Valid @RequestBody SubmitAssessmentRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.submitSelfAssessment(userId, request));
    }

    @PostMapping("/assessments/peer/{colleagueId}")
    public ResponseEntity<AssessmentResponse> submitPeerAssessment(
            Authentication authentication,
            @PathVariable Long colleagueId,
            @Valid @RequestBody SubmitAssessmentRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.submitPeerAssessment(userId, colleagueId, request));
    }

    @GetMapping("/assessments")
    public ResponseEntity<List<AssessmentResponse>> getAssessments(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.getAssessmentsReceived(userId));
    }

    @GetMapping("/gaps")
    public ResponseEntity<List<GapAnalysisResponse>> getGaps(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(gapAnalysisService.getStoredUserGaps(userId));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(recommendationService.getByEmployee(userId));
    }

    @PostMapping("/enrollments/{courseId}")
    public ResponseEntity<EnrollmentResponse> enrollCourse(
            Authentication authentication,
            @PathVariable Long courseId) {
        Long userId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.enrollCourse(userId, courseId));
    }

    @PutMapping("/enrollments/{id}/progress")
    public ResponseEntity<EnrollmentResponse> updateProgress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgressRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.updateProgress(userId, id, request.getProgress()));
    }

    @GetMapping("/enrollments")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollments(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.getEnrollments(userId));
    }

    @GetMapping("/achievements")
    public ResponseEntity<List<AchievementResponse>> getAchievements(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.getAchievements(userId));
    }

    @GetMapping("/certifications")
    public ResponseEntity<List<CertificationResponse>> getCertifications(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.getCertifications(userId));
    }

    @PostMapping("/certifications")
    public ResponseEntity<CertificationResponse> addCertification(
            Authentication authentication,
            @Valid @RequestBody CertificationRequest request) {
        Long userId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.addCertification(userId, request));
    }

    @GetMapping("/mentors")
    public ResponseEntity<List<RecommendedMentorResponse>> getMentors(
            Authentication authentication,
            @RequestParam Long skillId) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.getAvailableMentors(userId, skillId));
    }

    @PostMapping("/mentorship/request")
    public ResponseEntity<MentorshipResponse> requestMentorship(
            Authentication authentication,
            @RequestParam Long mentorId,
            @RequestParam Long targetSkillId) {
        Long userId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.requestMentorship(userId, mentorId, targetSkillId));
    }

    @PutMapping("/mentorship/{id}/accept")
    public ResponseEntity<MentorshipResponse> acceptMentorship(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.acceptMentorship(userId, id));
    }

    @PutMapping("/mentorship/{id}/complete")
    public ResponseEntity<MentorshipResponse> completeMentorship(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(employeeService.completeMentorship(userId, id));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(Authentication authentication) {
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(notificationService.getForUser(userId, userId));
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markNotificationRead(
            Authentication authentication,
            @PathVariable Long id) {
        Long userId = getUserId(authentication);
        notificationService.markAsRead(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/learning-paths")
    public ResponseEntity<List<LearningPathResponse>> getLearningPaths() {
        return ResponseEntity.ok(lndAdminService.getAllLearningPaths());
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
