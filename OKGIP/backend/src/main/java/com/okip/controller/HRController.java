package com.okip.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.hr.EmployeeApprovalResponseDTO;
import com.okip.dto.hr.HRDashboardDTO;
import com.okip.dto.hr.PendingEmployeeDTO;
import com.okip.service.hr.HRService;

@RestController
@RequestMapping("/api/hr")
public class HRController {

    private final HRService hrService;

    public HRController(HRService hrService) {
        this.hrService = hrService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<HRDashboardDTO> getDashboard() {
        return ResponseEntity.ok(hrService.getDashboard());
    }

    @PutMapping("/approve/{employeeId}")
    public ResponseEntity<EmployeeApprovalResponseDTO> approveEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(hrService.approveEmployee(employeeId));
    }

    @PutMapping("/reject/{employeeId}")
    public ResponseEntity<EmployeeApprovalResponseDTO> rejectEmployee(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(hrService.rejectEmployee(employeeId));
    }

    @GetMapping("/employees")
    public ResponseEntity<List<Map<String, Object>>> getEmployees() {
        return ResponseEntity.ok(hrService.getEmployees());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartments() {
        return ResponseEntity.ok(hrService.getDepartments());
    }

    @GetMapping("/job-roles")
    public ResponseEntity<List<Map<String, Object>>> getJobRoles() {
        return ResponseEntity.ok(hrService.getJobRoles());
    }

    @GetMapping("/workforce-skills")
    public ResponseEntity<List<Map<String, Object>>> getWorkforceSkills() {
        return ResponseEntity.ok(hrService.getWorkforceSkills());
    }

    @GetMapping("/competencies")
    public ResponseEntity<List<Map<String, Object>>> getCompetencies() {
        return ResponseEntity.ok(hrService.getCompetencies());
    }

    @GetMapping("/knowledge-gaps")
    public ResponseEntity<List<Map<String, Object>>> getKnowledgeGaps() {
        return ResponseEntity.ok(hrService.getKnowledgeGaps());
    }

    @GetMapping("/training-analytics")
    public ResponseEntity<Map<String, Object>> getTrainingAnalytics() {
        return ResponseEntity.ok(hrService.getTrainingAnalytics());
    }

    @GetMapping("/assessments")
    public ResponseEntity<List<Map<String, Object>>> getAssessments() {
        return ResponseEntity.ok(hrService.getAssessments());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PendingEmployeeDTO>> getPendingEmployees() {
        return ResponseEntity.ok(hrService.getPendingEmployees());
    }
}
