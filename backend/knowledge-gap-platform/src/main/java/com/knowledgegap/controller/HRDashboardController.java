package com.knowledgegap.controller;

import com.knowledgegap.service.HRDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/hr/dashboard")
@CrossOrigin(origins = "*")
public class HRDashboardController {

    private final HRDashboardService hrDashboardService;

    public HRDashboardController(
            HRDashboardService hrDashboardService) {

        this.hrDashboardService =
                hrDashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {

        return ResponseEntity.ok(
                hrDashboardService.getDashboardSummary()
        );
    }
}