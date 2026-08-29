package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.manager.AssignMentorshipRequest;
import com.orgskills.intelligence.dto.manager.GapHeatmapResponse;
import com.orgskills.intelligence.dto.manager.SkillCoverageResponse;
import com.orgskills.intelligence.dto.manager.TeamMemberSummary;
import com.orgskills.intelligence.dto.manager.TrainingAdoptionResponse;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.ManagerService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'SYSTEM_ADMIN', 'ADMIN')")
public class ManagerController {

    private final ManagerService managerService;

    @GetMapping("/team")
    public ResponseEntity<List<TeamMemberSummary>> getTeam(Authentication authentication) {
        Long managerId = getUserId(authentication);
        List<User> team = managerService.getTeamMembers(managerId);
        return ResponseEntity.ok(managerService.getMemberSummaries(team));
    }

    @GetMapping("/team/skill-coverage")
    public ResponseEntity<List<SkillCoverageResponse>> getSkillCoverage(Authentication authentication) {
        Long managerId = getUserId(authentication);
        List<User> team = managerService.getTeamMembers(managerId);
        return ResponseEntity.ok(managerService.getSkillCoverage(team));
    }

    @GetMapping("/team/gap-heatmap")
    public ResponseEntity<GapHeatmapResponse> getGapHeatmap(Authentication authentication) {
        Long managerId = getUserId(authentication);
        List<User> team = managerService.getTeamMembers(managerId);
        return ResponseEntity.ok(managerService.getGapHeatmap(team, "TEAM", "My Team"));
    }

    @GetMapping("/team/high-risk-gaps")
    public ResponseEntity<List<GapAnalysisResponse>> getHighRiskGaps(Authentication authentication) {
        Long managerId = getUserId(authentication);
        List<User> team = managerService.getTeamMembers(managerId);
        return ResponseEntity.ok(managerService.getHighRiskGaps(team));
    }

    @GetMapping("/team/{employeeId}/progress")
    public ResponseEntity<TeamMemberSummary> getEmployeeProgress(@PathVariable Long employeeId) {
        return ResponseEntity.ok(managerService.getEmployeeProgressSnapshot(employeeId));
    }

    @GetMapping("/team/training-adoption")
    public ResponseEntity<TrainingAdoptionResponse> getTrainingAdoption(Authentication authentication) {
        Long managerId = getUserId(authentication);
        List<User> team = managerService.getTeamMembers(managerId);
        return ResponseEntity.ok(managerService.getTrainingAdoption(team));
    }

    @GetMapping("/team/learning-progress")
    public ResponseEntity<TrainingAdoptionResponse> getLearningProgress(Authentication authentication) {
        Long managerId = getUserId(authentication);
        List<User> team = managerService.getTeamMembers(managerId);
        return ResponseEntity.ok(managerService.getTrainingAdoption(team));
    }

    @PostMapping("/team/{employeeId}/assign-training/{courseId}")
    public ResponseEntity<EnrollmentResponse> assignTraining(
            Authentication authentication,
            @PathVariable Long employeeId,
            @PathVariable Long courseId) {
        Long assignerId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(managerService.assignTraining(assignerId, employeeId, courseId));
    }

    @PostMapping("/team/{employeeId}/assign-mentorship")
    public ResponseEntity<MentorshipResponse> assignMentorship(
            Authentication authentication,
            @PathVariable Long employeeId,
            @Valid @RequestBody AssignMentorshipRequest request) {
        Long assignerId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                managerService.assignMentorship(assignerId, employeeId, request.getMentorId(), request.getTargetSkillId())
        );
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
