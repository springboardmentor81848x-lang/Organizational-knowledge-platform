package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.dto.AnalyticsResponse;
import com.team7.knowledge_gap_platform.service.AnalyticsService;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService) {

        this.analyticsService =
                analyticsService;
    }

    // Employee analytics
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<AnalyticsResponse>
    getEmployeeAnalytics(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                analyticsService
                        .getEmployeeAnalytics(
                                employeeId));
    }

    // Department analytics
    @GetMapping("/department/{departmentName}")
    public ResponseEntity<List<AnalyticsResponse>>
    getDepartmentAnalytics(
            @PathVariable String departmentName) {

        return ResponseEntity.ok(
                analyticsService
                        .getDepartmentAnalytics(
                                departmentName));
    }

    // Organization analytics
    @GetMapping("/organization")
    public ResponseEntity<List<AnalyticsResponse>>
    getOrganizationAnalytics() {

        return ResponseEntity.ok(
                analyticsService
                        .getOrganizationAnalytics());
    }
}