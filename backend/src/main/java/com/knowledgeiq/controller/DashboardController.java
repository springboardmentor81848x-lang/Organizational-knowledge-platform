package com.knowledgeiq.controller;

import com.knowledgeiq.dto.AdminDashboardDto;
import com.knowledgeiq.dto.EmployeeDashboardDto;
import com.knowledgeiq.dto.HrDashboardDto;
import com.knowledgeiq.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private com.knowledgeiq.service.TrainingService trainingService;

    @GetMapping("/employee")
    public ResponseEntity<EmployeeDashboardDto> getEmployeeDashboard(org.springframework.security.core.Authentication auth) {
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(dashboardService.getEmployeeDashboard(java.util.UUID.fromString(userId)));
    }

    @GetMapping("/learning-path")
    public ResponseEntity<?> getLearningPath(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).build();
        String userId = (String) auth.getPrincipal();
        return ResponseEntity.ok(trainingService.getPersonalizedLearningPath(java.util.UUID.fromString(userId)));
    }

    @GetMapping("/hr")
    @PreAuthorize("hasAnyRole('HR_SPECIALIST', 'SYSTEM_ADMIN')")
    public ResponseEntity<HrDashboardDto> getHrDashboard() {
        return ResponseEntity.ok(dashboardService.getHrDashboard());
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<AdminDashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboard());
    }
}
