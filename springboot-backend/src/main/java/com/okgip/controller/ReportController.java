package com.okgip.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    @GetMapping("/employee/{id}")
    public ResponseEntity<?> getEmployeeReport(@PathVariable Long id) {
        Map<String, Object> report = new HashMap<>();
        report.put("report_title", "Individual Employee Competency & Learning Report");
        report.put("generated_at", LocalDateTime.now());
        report.put("employee_id", id);
        report.put("employee_name", "Alex Rivera");
        report.put("department", "Engineering");
        report.put("designation", "Full Stack Engineer");

        List<Map<String, Object>> skills = List.of(
                Map.of("skill", "Spring Boot", "requiredLevel", 4, "currentLevel", 3, "improvement", "+1", "gap", 1, "status", "In Progress"),
                Map.of("skill", "React", "requiredLevel", 4, "currentLevel", 4, "improvement", "+2", "gap", 0, "status", "Resolved"),
                Map.of("skill", "Docker & Kubernetes", "requiredLevel", 3, "currentLevel", 3, "improvement", "+1", "gap", 0, "status", "Resolved")
        );
        report.put("skills", skills);
        return ResponseEntity.ok(Map.of("success", true, "data", report));
    }

    @GetMapping("/department/{id}")
    public ResponseEntity<?> getDepartmentReport(@PathVariable Long id) {
        Map<String, Object> report = new HashMap<>();
        report.put("report_title", "Department Learning & Skill Coverage Report");
        report.put("generated_at", LocalDateTime.now());
        report.put("department_name", "Software Engineering");
        report.put("total_employees", 50);
        report.put("eligible_employees", 50);
        report.put("enrolled_employees", 38);
        report.put("completed_employees", 25);
        report.put("completion_percentage", "65.8%");
        report.put("average_progress", "72%");
        report.put("average_skill_improvement", "+1.3 levels");
        return ResponseEntity.ok(Map.of("success", true, "data", report));
    }

    @GetMapping("/gaps")
    public ResponseEntity<?> getGapsReport() {
        List<Map<String, Object>> gaps = List.of(
                Map.of("employee_name", "Alex Rivera", "department", "Engineering", "skill_name", "Spring Boot", "required_proficiency", 4, "current_proficiency", 2, "gap_score", 2, "priority", "High", "status", "In Training"),
                Map.of("employee_name", "David Kumar", "department", "Engineering", "skill_name", "Kubernetes", "required_proficiency", 4, "current_proficiency", 2, "gap_score", 2, "priority", "High", "status", "Identified"),
                Map.of("employee_name", "Sarah Jenkins", "department", "Human Resources", "skill_name", "HR Analytics & BI", "required_proficiency", 4, "current_proficiency", 3, "gap_score", 1, "priority", "Medium", "status", "In Training")
        );
        return ResponseEntity.ok(Map.of("success", true, "report_title", "Organization Skill Gap Intelligence Matrix", "generated_at", LocalDateTime.now(), "data", gaps));
    }

    @GetMapping("/employees")
    public ResponseEntity<?> getEmployeesReport() {
        List<Map<String, Object>> emps = List.of(
                Map.of("employee_name", "Alex Rivera", "department", "Engineering", "designation", "Software Engineer", "skills_count", 6, "high_gaps_count", 1, "status", "Active"),
                Map.of("employee_name", "Sarah Jenkins", "department", "Engineering", "designation", "Lead Architect", "skills_count", 9, "high_gaps_count", 0, "status", "Active"),
                Map.of("employee_name", "Elena Rostova", "department", "Engineering", "designation", "Frontend Dev", "skills_count", 5, "high_gaps_count", 0, "status", "Active")
        );
        return ResponseEntity.ok(Map.of("success", true, "report_title", "Workforce Skill & Competency Inventory", "generated_at", LocalDateTime.now(), "data", emps));
    }

    @GetMapping("/trainings")
    public ResponseEntity<?> getTrainingsReport() {
        List<Map<String, Object>> list = List.of(
                Map.of("program_title", "Advanced Spring Boot Microservices", "employee_name", "Alex Rivera", "department", "Engineering", "status", "In Progress", "progress_percentage", 75, "due_date", "2026-09-30"),
                Map.of("program_title", "Docker & Kubernetes Orchestration", "employee_name", "David Kumar", "department", "Engineering", "status", "Completed", "progress_percentage", 100, "due_date", "2026-08-15")
        );
        return ResponseEntity.ok(Map.of("success", true, "report_title", "Training Programs & Adoption Analytics", "generated_at", LocalDateTime.now(), "data", list));
    }

    @GetMapping("/training-effectiveness")
    public ResponseEntity<?> getTrainingEffectivenessReport() {
        Map<String, Object> data = new HashMap<>();
        data.put("report_title", "Learning ROI & Training Effectiveness Intelligence");
        data.put("generated_at", LocalDateTime.now());
        data.put("total_courses_offered", 14);
        data.put("total_completions", 112);
        data.put("average_assessment_score", "84.5%");
        data.put("average_skill_level_gain", "+1.5 levels");
        data.put("estimated_productivity_roi", "185%");
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
