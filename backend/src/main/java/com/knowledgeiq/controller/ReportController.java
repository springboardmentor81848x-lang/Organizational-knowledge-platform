package com.knowledgeiq.controller;

import com.knowledgeiq.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/employee/{id}")
    public ResponseEntity<Map<String, Object>> getEmployeeReport(@PathVariable UUID id) {
        return ResponseEntity.ok(reportService.getEmployeeLearningReport(id));
    }

    @GetMapping("/employee/me")
    public ResponseEntity<Map<String, Object>> getMyEmployeeReport(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).build();
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(reportService.getEmployeeLearningReport(userId));
    }

    @GetMapping("/department/{id}")
    public ResponseEntity<Map<String, Object>> getDepartmentReport(@PathVariable UUID id) {
        return ResponseEntity.ok(reportService.getDepartmentTrainingReport(id));
    }

    @GetMapping("/department")
    public ResponseEntity<Map<String, Object>> getDefaultDepartmentReport(@RequestParam(required = false) UUID departmentId) {
        return ResponseEntity.ok(reportService.getDepartmentTrainingReport(departmentId));
    }

    @GetMapping("/gaps")
    public ResponseEntity<Map<String, Object>> getSkillGapReport(@RequestParam(required = false) UUID departmentId) {
        return ResponseEntity.ok(reportService.getSkillGapReport(departmentId));
    }

    @GetMapping("/training-effectiveness")
    public ResponseEntity<Map<String, Object>> getTrainingEffectivenessReport() {
        return ResponseEntity.ok(reportService.getTrainingEffectivenessReport());
    }

    @GetMapping("/export/employee/{id}.csv")
    public ResponseEntity<String> exportEmployeeCsv(@PathVariable UUID id) {
        Map<String, Object> report = reportService.getEmployeeLearningReport(id);
        @SuppressWarnings("unchecked")
        Map<String, Object> emp = (Map<String, Object>) report.get("employee");
        StringBuilder sb = new StringBuilder();
        sb.append("Employee Learning Report\n");
        sb.append("Name,").append(emp.get("fullName")).append("\n");
        sb.append("Email,").append(emp.get("email")).append("\n");
        sb.append("Role,").append(emp.get("roleTitle")).append("\n");
        sb.append("Department,").append(emp.get("department")).append("\n\n");

        sb.append("Skill,Category,Current Level,Required Level,Gap,Critical\n");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skills = (List<Map<String, Object>>) report.get("skills");
        if (skills != null) {
            for (Map<String, Object> s : skills) {
                sb.append(s.get("skillName")).append(",")
                  .append(s.get("category")).append(",")
                  .append(s.get("currentLevel")).append(",")
                  .append(s.get("requiredLevel")).append(",")
                  .append(s.get("gap")).append(",")
                  .append(s.get("isCritical")).append("\n");
            }
        }

        sb.append("\nCourse,Provider,Status,Progress,Enrolled At,Completed At\n");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trainings = (List<Map<String, Object>>) report.get("training");
        if (trainings != null) {
            for (Map<String, Object> t : trainings) {
                sb.append(t.get("title")).append(",")
                  .append(t.get("provider")).append(",")
                  .append(t.get("status")).append(",")
                  .append(t.get("progressPercent")).append("%,")
                  .append(t.get("enrolledAt")).append(",")
                  .append(t.get("completedAt")).append("\n");
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=employee_learning_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString());
    }

    @GetMapping("/export/department.csv")
    public ResponseEntity<String> exportDepartmentCsv(@RequestParam(required = false) UUID departmentId) {
        Map<String, Object> report = reportService.getDepartmentTrainingReport(departmentId);
        StringBuilder sb = new StringBuilder();
        sb.append("Department Training Report: ").append(report.get("departmentName")).append("\n");
        sb.append("Total Employees,").append(report.get("totalEmployees")).append("\n");
        sb.append("Enrolled,").append(report.get("enrolledEmployees")).append("\n");
        sb.append("Completed,").append(report.get("completedEmployees")).append("\n");
        sb.append("Completion Rate,").append(report.get("completionPercentage")).append("%\n");
        sb.append("Avg Progress,").append(report.get("averageProgress")).append("%\n\n");

        sb.append("Employee,Role,Courses Enrolled,Courses Completed,Average Progress,Status\n");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> emps = (List<Map<String, Object>>) report.get("employees");
        if (emps != null) {
            for (Map<String, Object> e : emps) {
                sb.append(e.get("fullName")).append(",")
                  .append(e.get("roleTitle")).append(",")
                  .append(e.get("enrolledCount")).append(",")
                  .append(e.get("completedCount")).append(",")
                  .append(e.get("averageProgress")).append("%,")
                  .append(e.get("status")).append("\n");
            }
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=department_training_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(sb.toString());
    }
}
