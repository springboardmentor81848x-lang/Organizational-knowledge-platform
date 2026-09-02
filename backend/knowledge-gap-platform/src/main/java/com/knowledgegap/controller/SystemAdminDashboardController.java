package com.knowledgegap.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.service.HRDashboardService;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class SystemAdminDashboardController {

    private final HRDashboardService hrDashboardService;

    public SystemAdminDashboardController(
            HRDashboardService hrDashboardService) {

        this.hrDashboardService = hrDashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {

        return ResponseEntity.ok(
                hrDashboardService.getDashboardSummary()
        );
    }
}