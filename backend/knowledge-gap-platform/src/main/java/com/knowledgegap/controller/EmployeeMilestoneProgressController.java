package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.EmployeeMilestoneProgress;
import com.knowledgegap.service.EmployeeMilestoneProgressService;

@RestController
@RequestMapping("/api/employee-milestone-progress")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeMilestoneProgressController {

    private final EmployeeMilestoneProgressService progressService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EmployeeMilestoneProgressController(
            EmployeeMilestoneProgressService progressService) {

        this.progressService = progressService;
    }

    // =========================================================
    // GET EMPLOYEE COURSE MILESTONES
    // =========================================================

    @GetMapping(
            "/employee/{employeeIdentifier}/course/{courseId}"
    )
    public ResponseEntity<List<EmployeeMilestoneProgress>>
    getEmployeeCourseProgress(
            @PathVariable String employeeIdentifier,
            @PathVariable Long courseId) {

        return ResponseEntity.ok(
                progressService.getEmployeeCourseProgress(
                        employeeIdentifier,
                        courseId
                )
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeMilestoneProgress>
    getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                progressService.getById(id)
        );
    }

    // =========================================================
    // UPDATE PROGRESS
    // =========================================================

    @PutMapping("/{id}/progress")
    public ResponseEntity<EmployeeMilestoneProgress>
    updateProgress(
            @PathVariable Long id,
            @RequestParam Integer progressPercentage) {

        return ResponseEntity.ok(
                progressService.updateProgress(
                        id,
                        progressPercentage
                )
        );
    }

    // =========================================================
    // COMPLETE MILESTONE
    // =========================================================

    @PutMapping("/{id}/complete")
    public ResponseEntity<EmployeeMilestoneProgress>
    completeMilestone(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                progressService.completeMilestone(id)
        );
    }
}