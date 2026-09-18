package com.knowledgegap.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.service.TrainingEnrollmentService;

@RestController
@RequestMapping("/api/training-enrollments")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainingEnrollmentController {

    private final TrainingEnrollmentService
            trainingEnrollmentService;

    public TrainingEnrollmentController(
            TrainingEnrollmentService trainingEnrollmentService) {

        this.trainingEnrollmentService =
                trainingEnrollmentService;
    }

    // =========================================================
    // ENROLL EMPLOYEE
    // =========================================================

    @PostMapping(
            "/employee/{employeeIdentifier}/course/{courseId}"
    )
    public ResponseEntity<TrainingEnrollment> enrollEmployee(
            @PathVariable String employeeIdentifier,
            @PathVariable Long courseId) {

        return ResponseEntity.ok(
                trainingEnrollmentService.enrollEmployee(
                        employeeIdentifier,
                        courseId
                )
        );
    }

    // =========================================================
    // GET EMPLOYEE ENROLLMENTS
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<TrainingEnrollment>>
    getEmployeeEnrollments(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                trainingEnrollmentService
                        .getEmployeeEnrollments(
                                employeeIdentifier
                        )
        );
    }

    // =========================================================
    // GET SINGLE ENROLLMENT
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<TrainingEnrollment>
    getEnrollmentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                trainingEnrollmentService
                        .getEnrollmentById(id)
        );
    }

    // =========================================================
    // START TRAINING
    // =========================================================

    @PutMapping("/{id}/start")
    public ResponseEntity<TrainingEnrollment>
    startTraining(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                trainingEnrollmentService
                        .startTraining(id)
        );
    }

    // =========================================================
    // UPDATE PROGRESS
    // =========================================================

    @PutMapping("/{id}/progress")
    public ResponseEntity<TrainingEnrollment>
    updateProgress(
            @PathVariable Long id,
            @RequestBody ProgressUpdateRequest request) {

        return ResponseEntity.ok(
                trainingEnrollmentService.updateProgress(
                        id,
                        request.getProgressPercentage()
                )
        );
    }

    // =========================================================
    // COMPLETE TRAINING
    // =========================================================

    @PutMapping("/{id}/complete")
    public ResponseEntity<TrainingEnrollment>
    completeTraining(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                trainingEnrollmentService
                        .completeTraining(id)
        );
    }

    // =========================================================
    // MARK CERTIFIED
    // =========================================================

    @PutMapping("/{id}/certify")
    public ResponseEntity<TrainingEnrollment>
    markCertified(
            @PathVariable Long id,
            @RequestBody CertificationRequest request) {

        return ResponseEntity.ok(
                trainingEnrollmentService.markCertified(
                        id,
                        request.getCertificationName(),
                        request.getCertificationExpiryDate(),
                        request.getCertificationUrl()
                )
        );
    }

    // =========================================================
    // MARK EXPIRED / RENEWAL
    // =========================================================

    @PutMapping("/{id}/expire")
    public ResponseEntity<TrainingEnrollment>
    markExpired(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                trainingEnrollmentService
                        .markExpired(id)
        );
    }

    // =========================================================
    // DELETE ENROLLMENT
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteEnrollment(
            @PathVariable Long id) {

        trainingEnrollmentService
                .deleteEnrollment(id);

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // PROGRESS DTO
    // =========================================================

    public static class ProgressUpdateRequest {

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

    // =========================================================
    // CERTIFICATION DTO
    // =========================================================

    public static class CertificationRequest {

        private String certificationName;

        private LocalDate certificationExpiryDate;

        private String certificationUrl;

        public String getCertificationName() {
            return certificationName;
        }

        public void setCertificationName(
                String certificationName) {

            this.certificationName =
                    certificationName;
        }

        public LocalDate getCertificationExpiryDate() {
            return certificationExpiryDate;
        }

        public void setCertificationExpiryDate(
                LocalDate certificationExpiryDate) {

            this.certificationExpiryDate =
                    certificationExpiryDate;
        }

        public String getCertificationUrl() {
            return certificationUrl;
        }

        public void setCertificationUrl(
                String certificationUrl) {

            this.certificationUrl =
                    certificationUrl;
        }
    }
}