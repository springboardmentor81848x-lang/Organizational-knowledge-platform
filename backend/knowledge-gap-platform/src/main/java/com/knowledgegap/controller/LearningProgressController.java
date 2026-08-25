package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.LearningProgress;
import com.knowledgegap.service.LearningProgressService;

@RestController
@RequestMapping("/api/learning-progress")
@CrossOrigin(origins = "http://localhost:5173")
public class LearningProgressController {

    private final LearningProgressService learningProgressService;

    public LearningProgressController(
            LearningProgressService learningProgressService) {

        this.learningProgressService =
                learningProgressService;
    }

    // =========================================================
    // GET EMPLOYEE LEARNING PROGRESS
    // GET /api/learning-progress/employee/EMP1001
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<LearningProgress>> getEmployeeProgress(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                learningProgressService
                        .getEmployeeProgress(employeeIdentifier)
        );
    }

    // =========================================================
    // CREATE LEARNING PROGRESS
    // POST /api/learning-progress
    // =========================================================

    @PostMapping
    public ResponseEntity<LearningProgress> saveProgress(
            @RequestBody LearningProgressRequest request) {

        LearningProgress progress =
                learningProgressService.saveProgress(
                        request.getEmployeeId(),
                        request.getCourseId(),
                        request.getProgressPercentage()
                );

        return ResponseEntity.ok(progress);
    }

    // =========================================================
    // UPDATE LEARNING PROGRESS
    // PUT /api/learning-progress/{id}
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<LearningProgress> updateProgress(
            @PathVariable Long id,
            @RequestBody UpdateProgressRequest request) {

        LearningProgress progress =
                learningProgressService.updateProgress(
                        id,
                        request.getProgressPercentage()
                );

        return ResponseEntity.ok(progress);
    }

    // =========================================================
    // GET PROGRESS BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<LearningProgress> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                learningProgressService.getById(id)
        );
    }

    // =========================================================
    // REQUEST DTO
    // =========================================================

    public static class LearningProgressRequest {

        private String employeeId;
        private Long courseId;
        private Integer progressPercentage;

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public Integer getProgressPercentage() {
            return progressPercentage;
        }

        public void setProgressPercentage(
                Integer progressPercentage) {

            this.progressPercentage =
                    progressPercentage;
        }
    }

    // =========================================================
    // UPDATE DTO
    // =========================================================

    public static class UpdateProgressRequest {

        private Integer progressPercentage;

        public Integer getProgressPercentage() {
            return progressPercentage;
        }

        public void setProgressPercentage(
                Integer progressPercentage) {

            this.progressPercentage =
                    progressPercentage;
        }
    }
}