package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.ld.LearningPathResponse;
import com.orgskills.intelligence.entity.LearningPathStep;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ForbiddenException;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.repository.LearningPathStepRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.LearningPathService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/learning-paths")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'DEPARTMENT_HEAD', 'HR_SPECIALIST', 'HR_ADMIN', 'LND_ADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
public class LearningPathController {

    private final LearningPathService learningPathService;
    private final UserRepository userRepository;
    private final LearningPathStepRepository learningPathStepRepository;

    @PostMapping("/{employeeId}/generate")
    public ResponseEntity<List<LearningPathResponse>> generateLearningPaths(
            Authentication authentication,
            @PathVariable Long employeeId) {
        validateAccess(authentication, employeeId, false);
        return ResponseEntity.ok(learningPathService.generateLearningPathsForEmployee(employeeId));
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<List<LearningPathResponse>> getLearningPaths(
            Authentication authentication,
            @PathVariable Long employeeId) {
        validateAccess(authentication, employeeId, false);
        return ResponseEntity.ok(learningPathService.getLearningPathsForEmployee(employeeId));
    }

    @GetMapping("/{employeeId}/{pathId}")
    public ResponseEntity<LearningPathResponse> getLearningPathDetail(
            Authentication authentication,
            @PathVariable Long employeeId,
            @PathVariable Long pathId) {
        validateAccess(authentication, employeeId, false);
        return ResponseEntity.ok(learningPathService.getLearningPathDetail(employeeId, pathId));
    }

    @PutMapping("/steps/{stepId}/complete")
    public ResponseEntity<LearningPathResponse> completeStep(
            Authentication authentication,
            @PathVariable Long stepId) {
        LearningPathStep step = learningPathStepRepository.findById(stepId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning path step not found for id: " + stepId));

        Long ownerId = step.getLearningPath() != null && step.getLearningPath().getEmployee() != null
                ? step.getLearningPath().getEmployee().getId()
                : null;

        if (ownerId != null) {
            validateAccess(authentication, ownerId, true);
        }

        return ResponseEntity.ok(learningPathService.completeStepManually(stepId));
    }

    private void validateAccess(Authentication authentication, Long targetEmployeeId, boolean requiresEditPermission) {
        if (authentication == null) {
            throw new UnauthorizedException("Not authenticated");
        }

        Long currentUserId = null;
        if (authentication.getPrincipal() instanceof CustomPrincipal principal) {
            currentUserId = principal.getUserId();
        }

        // 1. Target employee themselves can always view and edit their own paths
        if (currentUserId != null && currentUserId.equals(targetEmployeeId)) {
            return;
        }

        Set<String> authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        boolean isAdminOrLnd = authorities.contains("ROLE_SYSTEM_ADMIN") || authorities.contains("ROLE_ADMIN") || authorities.contains("ROLE_LND_ADMIN");
        boolean isHrOrDeptHead = authorities.contains("ROLE_HR_ADMIN") || authorities.contains("ROLE_HR_SPECIALIST") || authorities.contains("ROLE_DEPARTMENT_HEAD");
        boolean isManager = authorities.contains("ROLE_MANAGER");
        boolean isEmployee = authorities.contains("ROLE_EMPLOYEE") || authorities.contains("ROLE_USER");

        // If editing is required, managers/viewers cannot edit other users' steps
        if (requiresEditPermission && !isAdminOrLnd && !isEmployee) {
            throw new ForbiddenException("Access denied. Only the employee or L&D Admin can complete learning path steps.");
        }

        // 2. Admins, LND Admin, HR Admin, HR Specialist, Department Head, or Employee can view
        if (isAdminOrLnd || isHrOrDeptHead || isEmployee) {
            return;
        }

        // 3. Manager checking direct report
        if (isManager && currentUserId != null) {
            User targetEmployee = userRepository.findById(targetEmployeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found for id: " + targetEmployeeId));
            if (targetEmployee.getManager() != null && targetEmployee.getManager().getId().equals(currentUserId)) {
                return;
            }
        } else if (isManager) {
            return;
        }

        throw new ForbiddenException("Access denied. You do not have permission for employeeId: " + targetEmployeeId);
    }
}
