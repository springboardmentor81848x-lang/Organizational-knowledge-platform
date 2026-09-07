package com.okip.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.analytics.*;
import com.okip.service.analytics.AnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/employee/{employeeId}/summary")
    public ResponseEntity<EmployeeAnalyticsDTO> getEmployeeSummary(@PathVariable Long employeeId) {
        return ResponseEntity.ok(analyticsService.getEmployeeAnalytics(employeeId));
    }

    @GetMapping("/employee/{employeeId}/skill-gaps")
    public ResponseEntity<List<SkillGapAnalyticsDTO>> getEmployeeSkillGaps(@PathVariable Long employeeId) {
        return ResponseEntity.ok(analyticsService.getEmployeeSkillGaps(employeeId));
    }

    @GetMapping("/employee/{employeeId}/proficiency")
    public ResponseEntity<List<ProficiencyAnalyticsDTO>> getEmployeeProficiency(@PathVariable Long employeeId) {
        return ResponseEntity.ok(analyticsService.getEmployeeProficiency(employeeId));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<List<TeamAnalyticsDTO>> getTeamAnalytics() {
        return ResponseEntity.ok(analyticsService.getTeamAnalytics());
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<List<DepartmentAnalyticsDTO>> getDepartmentAnalytics() {
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics());
    }

    @GetMapping("/my/summary")
    public ResponseEntity<EmployeeAnalyticsDTO> getMySummary() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Long employeeId = analyticsService.getEmployeeIdByEmail(email);
        return ResponseEntity.ok(analyticsService.getEmployeeAnalytics(employeeId));
    }

    @GetMapping("/my/skill-gaps")
    public ResponseEntity<List<SkillGapAnalyticsDTO>> getMySkillGaps() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Long employeeId = analyticsService.getEmployeeIdByEmail(email);
        return ResponseEntity.ok(analyticsService.getEmployeeSkillGaps(employeeId));
    }

    @GetMapping("/my/proficiency")
    public ResponseEntity<List<ProficiencyAnalyticsDTO>> getMyProficiency() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Long employeeId = analyticsService.getEmployeeIdByEmail(email);
        return ResponseEntity.ok(analyticsService.getEmployeeProficiency(employeeId));
    }

    // Milestone 3 Enhancements
    @GetMapping("/dashboard/my")
    public ResponseEntity<DashboardSummaryDTO> getMyDashboard() {
        return ResponseEntity.ok(analyticsService.getMyDashboardSummary());
    }

    @GetMapping("/dashboard/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<DashboardSummaryDTO> getEmployeeDashboard(@PathVariable Long employeeId) {
        return ResponseEntity.ok(analyticsService.getEmployeeDashboardSummary(employeeId));
    }

    @GetMapping("/manager/heatmap")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<ManagerHeatmapDTO> getManagerTeamHeatmap() {
        return ResponseEntity.ok(analyticsService.getManagerTeamHeatmap());
    }

    @GetMapping("/manager/high-risk-gaps")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<List<HighRiskGapDTO>> getHighRiskGaps() {
        return ResponseEntity.ok(analyticsService.getHighRiskGaps());
    }

    @GetMapping("/hr/workforce-summary")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<HRWorkforceSummaryDTO> getHRWorkforceSummary() {
        return ResponseEntity.ok(analyticsService.getHRWorkforceSummary());
    }

    @GetMapping("/hr/department-comparison")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<List<DepartmentComparisonDTO>> getDepartmentComparisons() {
        return ResponseEntity.ok(analyticsService.getDepartmentComparisons());
    }
}
