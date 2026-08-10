package com.okip.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.analytics.DepartmentAnalyticsDTO;
import com.okip.dto.analytics.EmployeeAnalyticsDTO;
import com.okip.dto.analytics.ProficiencyAnalyticsDTO;
import com.okip.dto.analytics.SkillGapAnalyticsDTO;
import com.okip.dto.analytics.TeamAnalyticsDTO;
import com.okip.service.analytics.AnalyticsService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService) {

        this.analyticsService =
                analyticsService;
    }

    @GetMapping("/employee/{employeeId}/summary")
    public ResponseEntity<EmployeeAnalyticsDTO>
            getEmployeeSummary(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                analyticsService
                        .getEmployeeAnalytics(
                                employeeId));
    }

    @GetMapping("/employee/{employeeId}/skill-gaps")
    public ResponseEntity<List<SkillGapAnalyticsDTO>>
            getEmployeeSkillGaps(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                analyticsService
                        .getEmployeeSkillGaps(
                                employeeId));
    }

    @GetMapping("/employee/{employeeId}/proficiency")
    public ResponseEntity<List<ProficiencyAnalyticsDTO>>
            getEmployeeProficiency(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                analyticsService
                        .getEmployeeProficiency(
                                employeeId));
    }

    @GetMapping("/team")
    public ResponseEntity<List<TeamAnalyticsDTO>>
            getTeamAnalytics() {

        return ResponseEntity.ok(
                analyticsService
                        .getTeamAnalytics());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentAnalyticsDTO>>
            getDepartmentAnalytics() {

        return ResponseEntity.ok(
                analyticsService
                        .getDepartmentAnalytics());
    }
    
    @GetMapping("/my/summary")
    public ResponseEntity<EmployeeAnalyticsDTO> getMySummary() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        String email = authentication.getName();

        Long employeeId =
                analyticsService.getEmployeeIdByEmail(email);

        return ResponseEntity.ok(
                analyticsService
                        .getEmployeeAnalytics(employeeId));
    }
    @GetMapping("/my/skill-gaps")
    public ResponseEntity<List<SkillGapAnalyticsDTO>>
            getMySkillGaps() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        String email = authentication.getName();

        Long employeeId =
                analyticsService.getEmployeeIdByEmail(email);

        return ResponseEntity.ok(
                analyticsService
                        .getEmployeeSkillGaps(employeeId));
    }
    @GetMapping("/my/proficiency")
    public ResponseEntity<List<ProficiencyAnalyticsDTO>>
            getMyProficiency() {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        String email = authentication.getName();

        Long employeeId =
                analyticsService.getEmployeeIdByEmail(email);

        return ResponseEntity.ok(
                analyticsService
                        .getEmployeeProficiency(employeeId));
    }
}