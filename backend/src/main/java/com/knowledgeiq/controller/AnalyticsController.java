package com.knowledgeiq.controller;

import com.knowledgeiq.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/dashboard-summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/export/gaps.csv")
    public ResponseEntity<String> exportGapsCsv() {
        String csvContent = analyticsService.generateGapReportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=knowledgeiq_gaps_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }

    @GetMapping("/export/training.csv")
    public ResponseEntity<String> exportTrainingCsv() {
        String csvContent = analyticsService.generateTrainingReportCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=knowledgeiq_training_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }

    @Autowired
    private com.knowledgeiq.service.DashboardService dashboardService;

    @Autowired
    private com.knowledgeiq.service.ManagerService managerService;

    @Autowired
    private com.knowledgeiq.repository.UserRepository userRepository;

    @GetMapping("/employee/{id}")
    public ResponseEntity<?> getEmployeeAnalytics(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboard(id));
    }

    @GetMapping("/team/{id}")
    public ResponseEntity<?> getTeamAnalytics(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        com.knowledgeiq.model.User manager = userRepository.findById(id).orElse(null);
        if (manager != null) {
            return ResponseEntity.ok(managerService.getTeamGaps(manager));
        }
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/department/{id}")
    public ResponseEntity<?> getDepartmentAnalytics(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/organization")
    public ResponseEntity<?> getOrganizationAnalytics() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }
}

