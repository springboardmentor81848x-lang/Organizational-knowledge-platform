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
import com.orgskills.intelligence.repository.UserRepository;
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
@RequestMapping("/api/department-head")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'SYSTEM_ADMIN', 'ADMIN')")
public class DepartmentHeadController {

    private final ManagerService managerService;
    private final UserRepository userRepository;

    @GetMapping("/department")
    public ResponseEntity<List<TeamMemberSummary>> getDepartment(Authentication authentication) {
        String dept = resolveUserDepartment(authentication);
        List<User> members = managerService.getDepartmentMembers(dept);
        return ResponseEntity.ok(managerService.getMemberSummaries(members));
    }

    @GetMapping("/skill-coverage")
    public ResponseEntity<List<SkillCoverageResponse>> getSkillCoverage(Authentication authentication) {
        String dept = resolveUserDepartment(authentication);
        List<User> members = managerService.getDepartmentMembers(dept);
        return ResponseEntity.ok(managerService.getSkillCoverage(members));
    }

    @GetMapping("/gap-heatmap")
    public ResponseEntity<GapHeatmapResponse> getGapHeatmap(Authentication authentication) {
        String dept = resolveUserDepartment(authentication);
        List<User> members = managerService.getDepartmentMembers(dept);
        return ResponseEntity.ok(managerService.getGapHeatmap(members, "DEPARTMENT", dept));
    }

    @GetMapping("/high-risk-gaps")
    public ResponseEntity<List<GapAnalysisResponse>> getHighRiskGaps(Authentication authentication) {
        String dept = resolveUserDepartment(authentication);
        List<User> members = managerService.getDepartmentMembers(dept);
        return ResponseEntity.ok(managerService.getHighRiskGaps(members));
    }

    @GetMapping("/{employeeId}/progress")
    public ResponseEntity<TeamMemberSummary> getEmployeeProgress(@PathVariable Long employeeId) {
        return ResponseEntity.ok(managerService.getEmployeeProgressSnapshot(employeeId));
    }

    @GetMapping("/training-adoption")
    public ResponseEntity<TrainingAdoptionResponse> getTrainingAdoption(Authentication authentication) {
        String dept = resolveUserDepartment(authentication);
        List<User> members = managerService.getDepartmentMembers(dept);
        return ResponseEntity.ok(managerService.getTrainingAdoption(members));
    }

    @PostMapping("/{employeeId}/assign-training/{courseId}")
    public ResponseEntity<EnrollmentResponse> assignTraining(
            Authentication authentication,
            @PathVariable Long employeeId,
            @PathVariable Long courseId) {
        Long assignerId = getUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(managerService.assignTraining(assignerId, employeeId, courseId));
    }

    @PostMapping("/{employeeId}/assign-mentorship")
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

    private String resolveUserDepartment(Authentication authentication) {
        Long userId = getUserId(authentication);
        User user = userRepository.findById(userId).orElse(null);
        return user != null ? user.getDepartment() : "Engineering";
    }
}
