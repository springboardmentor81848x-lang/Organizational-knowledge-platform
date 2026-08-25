package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.service.TrainingEnrollmentService;

@RestController
@RequestMapping("/api/training-enrollments")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainingEnrollmentController {


    private final TrainingEnrollmentService
            enrollmentService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TrainingEnrollmentController(
            TrainingEnrollmentService enrollmentService) {

        this.enrollmentService =
                enrollmentService;
    }


    // =========================================================
    // ENROLL
    // =========================================================

    @PostMapping(
            "/employee/{employeeIdentifier}/course/{courseId}"
    )
    public ResponseEntity<TrainingEnrollment>
    enrollEmployee(
            @PathVariable String employeeIdentifier,
            @PathVariable Long courseId) {

        TrainingEnrollment enrollment =
                enrollmentService.enrollEmployee(
                        employeeIdentifier,
                        courseId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(enrollment);
    }


    // =========================================================
    // GET EMPLOYEE ENROLLMENTS
    // =========================================================

    @GetMapping(
            "/employee/{employeeIdentifier}"
    )
    public ResponseEntity<List<TrainingEnrollment>>
    getEmployeeEnrollments(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                enrollmentService
                        .getEmployeeEnrollments(
                                employeeIdentifier
                        )
        );
    }


    // =========================================================
    // GET ENROLLMENT BY ID
    // =========================================================

    @GetMapping("/{enrollmentId}")
    public ResponseEntity<TrainingEnrollment>
    getEnrollment(
            @PathVariable Long enrollmentId) {

        return ResponseEntity.ok(
                enrollmentService
                        .getEnrollmentById(
                                enrollmentId
                        )
        );
    }


    // =========================================================
    // START TRAINING
    // =========================================================

    @PutMapping("/{enrollmentId}/start")
    public ResponseEntity<TrainingEnrollment>
    startTraining(
            @PathVariable Long enrollmentId) {

        return ResponseEntity.ok(
                enrollmentService
                        .startTraining(
                                enrollmentId
                        )
        );
    }


    // =========================================================
    // UPDATE PROGRESS
    // =========================================================

    @PutMapping(
            "/{enrollmentId}/progress"
    )
    public ResponseEntity<TrainingEnrollment>
    updateProgress(
            @PathVariable Long enrollmentId,
            @RequestParam Integer progressPercentage) {

        return ResponseEntity.ok(
                enrollmentService.updateProgress(
                        enrollmentId,
                        progressPercentage
                )
        );
    }


    // =========================================================
    // COMPLETE TRAINING
    // =========================================================

    @PutMapping("/{enrollmentId}/complete")
    public ResponseEntity<TrainingEnrollment>
    completeTraining(
            @PathVariable Long enrollmentId) {

        return ResponseEntity.ok(
                enrollmentService
                        .completeTraining(
                                enrollmentId
                        )
        );
    }


    // =========================================================
    // CERTIFY
    // =========================================================

    @PutMapping("/{enrollmentId}/certify")
    public ResponseEntity<TrainingEnrollment>
    markCertified(
            @PathVariable Long enrollmentId) {

        return ResponseEntity.ok(
                enrollmentService
                        .markCertified(
                                enrollmentId
                        )
        );
    }


    // =========================================================
    // EXPIRED / RENEWAL
    // =========================================================

    @PutMapping(
            "/{enrollmentId}/expired-renewal"
    )
    public ResponseEntity<TrainingEnrollment>
    markExpiredForRenewal(
            @PathVariable Long enrollmentId) {

        return ResponseEntity.ok(
                enrollmentService
                        .markExpiredForRenewal(
                                enrollmentId
                        )
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    @DeleteMapping("/{enrollmentId}")
    public ResponseEntity<Void>
    deleteEnrollment(
            @PathVariable Long enrollmentId) {

        enrollmentService
                .deleteEnrollment(
                        enrollmentId
                );

        return ResponseEntity
                .noContent()
                .build();
    }
}