package com.knowledgegap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.dto.DepartmentDashboardDTO;
import com.knowledgegap.service.DepartmentDashboardService;

@RestController
@RequestMapping("/api/department-head")
@CrossOrigin(origins = "http://localhost:5173")
public class DepartmentDashboardController {

    private final DepartmentDashboardService
            departmentDashboardService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public DepartmentDashboardController(
            DepartmentDashboardService departmentDashboardService) {

        this.departmentDashboardService =
                departmentDashboardService;
    }

    // =========================================================
    // DEPARTMENT HEAD DASHBOARD
    // =========================================================

    @GetMapping("/dashboard/{employeeIdentifier}")
    public ResponseEntity<DepartmentDashboardDTO>
    getDepartmentDashboard(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                departmentDashboardService
                        .getDepartmentDashboard(
                                employeeIdentifier
                        )
        );
    }
}