package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.enrollment.TrainingEnrollmentRequestDTO;
import com.okip.dto.enrollment.TrainingEnrollmentResponseDTO;
import com.okip.dto.enrollment.TrainingProgressRequestDTO;
import com.okip.service.enrollment.TrainingEnrollmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/training-enrollments")
@Validated
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR','ADMIN')")
public class TrainingEnrollmentController {

    private final TrainingEnrollmentService trainingEnrollmentService;

    public TrainingEnrollmentController(
            TrainingEnrollmentService trainingEnrollmentService) {
        this.trainingEnrollmentService = trainingEnrollmentService;
    }

    @PostMapping
    public ResponseEntity<TrainingEnrollmentResponseDTO> enroll(
            @Valid @RequestBody TrainingEnrollmentRequestDTO request) {
        return new ResponseEntity<>(
                trainingEnrollmentService.enroll(request),
                HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TrainingEnrollmentResponseDTO>> getMyEnrollments() {
        return ResponseEntity.ok(
                trainingEnrollmentService.getMyEnrollments());
    }

    @PutMapping("/{enrollmentId}/progress")
    public ResponseEntity<TrainingEnrollmentResponseDTO> updateProgress(
            @PathVariable Long enrollmentId,
            @Valid @RequestBody TrainingProgressRequestDTO request) {
        return ResponseEntity.ok(
                trainingEnrollmentService.updateProgress(
                        enrollmentId,
                        request));
    }

    @GetMapping("/team")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<List<TrainingEnrollmentResponseDTO>> getTeamEnrollments() {
        return ResponseEntity.ok(trainingEnrollmentService.getTeamEnrollments());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<List<TrainingEnrollmentResponseDTO>> getAllEnrollments() {
        return ResponseEntity.ok(trainingEnrollmentService.getAllEnrollments());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('MANAGER','HR','ADMIN')")
    public ResponseEntity<List<TrainingEnrollmentResponseDTO>> getEmployeeEnrollments(
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(trainingEnrollmentService.getEmployeeEnrollments(employeeId));
    }
}
