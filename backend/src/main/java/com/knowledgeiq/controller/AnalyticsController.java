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
}
