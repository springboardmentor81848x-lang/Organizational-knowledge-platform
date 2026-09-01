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

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LearningProgressController(
            LearningProgressService learningProgressService) {

        this.learningProgressService =
                learningProgressService;
    }

    // =========================================================
    // GET ALL EMPLOYEE LEARNING PROGRESS
    //
    // GET
    // /api/learning-progress/employee/EMP1001
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<LearningProgress>>
    getEmployeeProgress(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                learningProgressService
                        .getEmployeeProgress(
                                employeeIdentifier
                        )
        );
    }

    // =========================================================
    // GET EMPLOYEE + COURSE PROGRESS
    //
    // GET
    // /api/learning-progress/employee/EMP1001/course/1
    // =========================================================

    @GetMapping(
            "/employee/{employeeIdentifier}/course/{courseId}"
    )
    public ResponseEntity<LearningProgress>
    getEmployeeCourseProgress(
            @PathVariable String employeeIdentifier,
            @PathVariable Long courseId) {

        return ResponseEntity.ok(
                learningProgressService
                        .getEmployeeCourseProgress(
                                employeeIdentifier,
                                courseId
                        )
        );
    }

    // =========================================================
    // UPDATE LEARNING PROGRESS
    //
    // PUT
    // /api/learning-progress/1
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<LearningProgress>
    updateProgress(
            @PathVariable Long id,
            @RequestBody UpdateProgressRequest request) {

        LearningProgress progress =
                learningProgressService
                        .updateProgress(
                                id,
                                request.getProgressPercentage()
                        );

        return ResponseEntity.ok(progress);
    }

    // =========================================================
    // GET PROGRESS BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<LearningProgress>
    getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                learningProgressService
                        .getById(id)
        );
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