package com.knowledgegap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.service.ManagerDashboardService;
import com.knowledgegap.service.ManagerDashboardService.ManagerDashboardResponse;
import com.knowledgegap.service.ManagerDashboardService.TeamSkillCoverageResponse;

@RestController
@RequestMapping("/api/manager-dashboard")
public class ManagerDashboardController {

    private final ManagerDashboardService managerDashboardService;

    public ManagerDashboardController(
            ManagerDashboardService managerDashboardService) {

        this.managerDashboardService = managerDashboardService;
    }

    // =========================================================
    // COMPLETE MANAGER DASHBOARD
    // =========================================================

    @GetMapping("/manager/{managerEmployeeId}")
    public ResponseEntity<ManagerDashboardResponse> getManagerDashboard(
            @PathVariable String managerEmployeeId) {

        ManagerDashboardResponse response =
                managerDashboardService.getDashboard(
                        managerEmployeeId
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // TEAM SKILL COVERAGE
    // =========================================================

    @GetMapping("/team-skills/{managerEmployeeId}")
    public ResponseEntity<TeamSkillCoverageResponse> getTeamSkillCoverage(
            @PathVariable String managerEmployeeId) {

        TeamSkillCoverageResponse response =
                managerDashboardService.getTeamSkillCoverage(
                        managerEmployeeId
                );

        return ResponseEntity.ok(response);
    }
}