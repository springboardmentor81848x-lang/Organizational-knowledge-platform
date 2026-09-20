package com.okip.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.analytics.SkillGapHeatmapDTO;
import com.okip.dto.analytics.TeamAnalyticsDTO;
import com.okip.dto.jobroleassignment.AssignJobRoleRequestDTO;
import com.okip.dto.jobroleassignment.JobRoleAssignmentResponseDTO;
import com.okip.dto.manager.ManagerEmployeeOptionDTO;
import com.okip.entity.master.Employee;
import com.okip.enums.AccountStatus;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.service.jobroleassignment.JobRoleAssignmentService;
import com.okip.service.manager.ManagerService;

@RestController
@RequestMapping("/api/manager")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerController {

    private final EmployeeRepository employeeRepository;
    private final EmployeeJobRoleRepository assignmentRepository;
    private final JobRoleAssignmentService assignmentService;
    private final ManagerService managerService;

    public ManagerController(
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository assignmentRepository,
            JobRoleAssignmentService assignmentService,
            ManagerService managerService) {
        this.employeeRepository = employeeRepository;
        this.assignmentRepository = assignmentRepository;
        this.assignmentService = assignmentService;
        this.managerService = managerService;
    }

    /**
     * Returns only employees assigned to the authenticated manager.
     */
    @GetMapping("/team")
    public ResponseEntity<List<TeamAnalyticsDTO>> team() {
        return ResponseEntity.ok(managerService.getTeam());
    }

    /**
     * Team-scoped skill-gap heatmap.
     */
    @GetMapping("/team/skill-heatmap")
    public ResponseEntity<List<SkillGapHeatmapDTO>> heatmap() {
        return ResponseEntity.ok(managerService.getTeamHeatmap());
    }

    /**
     * Department analytics for the authenticated manager's team.
     */
    @GetMapping("/departments")
    public ResponseEntity<?> departments() {
        return ResponseEntity.ok(managerService.getTeamDepartments());
    }

    /**
     * Training adoption and learning-progress analytics for the manager's team.
     */
    @GetMapping("/training-analytics")
    public ResponseEntity<Map<String, Object>> trainingAnalytics() {
        return ResponseEntity.ok(managerService.getTrainingAnalytics());
    }

    /**
     * Complete manager dashboard payload.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(managerService.getReport());
    }

    @GetMapping("/available-employees")
    public ResponseEntity<List<ManagerEmployeeOptionDTO>> available() {
        Employee manager = current();

        var teamIds = assignmentRepository
                .findByAssignedByAndActiveTrue(manager)
                .stream()
                .map(a -> a.getEmployee().getEmployeeId())
                .collect(Collectors.toSet());

        var result = employeeRepository.findByStatus(AccountStatus.APPROVED)
                .stream()
                .filter(e -> !e.getEmployeeId().equals(manager.getEmployeeId()))
                .map(e -> {
                    var dto = new ManagerEmployeeOptionDTO();
                    dto.setEmployeeId(e.getEmployeeId());
                    dto.setEmployeeCode(e.getEmployeeCode());
                    dto.setEmployeeName(e.getFirstName() + " " + e.getLastName());
                    dto.setEmail(e.getOfficialEmail());
                    dto.setDepartmentName(
                            e.getDepartment() == null
                                    ? null
                                    : e.getDepartment().getDepartmentName());
                    dto.setAlreadyInMyTeam(teamIds.contains(e.getEmployeeId()));

                    assignmentRepository.findByEmployeeAndActiveTrue(e)
                            .stream()
                            .findFirst()
                            .ifPresent(a -> dto.setCurrentJobRole(
                                    a.getJobRole().getJobRoleName()));
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    @PostMapping("/team/assign")
    public ResponseEntity<JobRoleAssignmentResponseDTO> assign(
            @RequestBody AssignJobRoleRequestDTO request) {

        Employee manager = current();

        if (request.getEmployeeId() == null
                || request.getEmployeeId().equals(manager.getEmployeeId())) {
            throw new IllegalArgumentException(
                    "A manager cannot assign their own account.");
        }

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        if (employee.getStatus() != AccountStatus.APPROVED) {
            throw new IllegalArgumentException(
                    "Only approved employees can be assigned to a team.");
        }

        return ResponseEntity.ok(assignmentService.assignJobRole(request));
    }

    @GetMapping("/assessment-analytics")
    public ResponseEntity<Map<String, Object>> assessmentAnalytics() {
        return ResponseEntity.ok(managerService.getAssessmentAnalytics());
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> reports() {
        return ResponseEntity.ok(managerService.getReport());
    }

    @GetMapping("/employee/{employeeId}/gap-analysis")
    public ResponseEntity<com.okip.dto.gap.GapAnalysisResponseDTO> employeeGapAnalysis(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(managerService.getGapAnalysis(employeeId));
    }

    @PostMapping("/employee/{employeeId}/gap-analysis/run")
    public ResponseEntity<com.okip.dto.gap.GapAnalysisResponseDTO> runEmployeeGapAnalysis(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(managerService.runGapAnalysis(employeeId));
    }

    private Employee current() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("Authenticated manager is required.");
        }

        return employeeRepository.findByOfficialEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Authenticated manager not found."));
    }
}
