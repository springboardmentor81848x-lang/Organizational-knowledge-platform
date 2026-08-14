package com.knowledgeiq.controller;

import com.knowledgeiq.dto.*;
import com.knowledgeiq.model.CourseEnrollment;
import com.knowledgeiq.model.User;
import com.knowledgeiq.repository.UserRepository;
import com.knowledgeiq.service.ManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasAnyRole('MANAGER', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN', 'HR_SPECIALIST', 'L_AND_D_ADMIN')")
public class ManagerController {

    @Autowired
    private ManagerService managerService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        try {
            String userIdStr = (String) auth.getPrincipal();
            return userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<TeamGapSummaryDto> getManagerDashboard(Authentication auth) {
        User manager = getAuthenticatedUser(auth);
        if (manager == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(managerService.getTeamGaps(manager));
    }

    @GetMapping("/team-gaps")
    public ResponseEntity<TeamGapSummaryDto> getTeamGaps(Authentication auth) {
        User manager = getAuthenticatedUser(auth);
        if (manager == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(managerService.getTeamGaps(manager));
    }

    @GetMapping("/team-profiles")
    public ResponseEntity<List<TeamMemberProfileDto>> getTeamProfiles(Authentication auth) {
        User manager = getAuthenticatedUser(auth);
        if (manager == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(managerService.getTeamProfiles(manager));
    }

    @GetMapping("/heatmap-data")
    public ResponseEntity<HeatmapResponseDto> getHeatmapData(Authentication auth) {
        User manager = getAuthenticatedUser(auth);
        if (manager == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(managerService.getHeatmapData(manager));
    }

    @GetMapping("/employee/{id}/recommendations")
    public ResponseEntity<PersonalizedLearningPathDto> getEmployeeRecommendations(@PathVariable("id") String employeeIdStr, Authentication auth) {
        User manager = getAuthenticatedUser(auth);
        if (manager == null) {
            return ResponseEntity.status(401).build();
        }
        UUID employeeId = null;
        try {
            employeeId = UUID.fromString(employeeIdStr);
        } catch (Exception ignored) {}
        return ResponseEntity.ok(managerService.getEmployeeRecommendations(manager, employeeId));
    }

    @PostMapping("/assign-course")
    public ResponseEntity<CourseEnrollment> assignCourse(@RequestBody AssignCourseRequestDto dto, Authentication auth) {
        User manager = getAuthenticatedUser(auth);
        if (manager == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(managerService.assignCourseToEmployee(manager, dto));
    }

    @PostMapping("/employee/{id}/assign-course")
    public ResponseEntity<CourseEnrollment> assignCourseToEmployee(
            @PathVariable("id") String employeeIdStr,
            @RequestBody AssignCourseRequestDto dto,
            Authentication auth) {
        User manager = getAuthenticatedUser(auth);
        if (manager == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            dto.setEmployeeId(UUID.fromString(employeeIdStr));
        } catch (Exception ignored) {}
        return ResponseEntity.ok(managerService.assignCourseToEmployee(manager, dto));
    }
}
