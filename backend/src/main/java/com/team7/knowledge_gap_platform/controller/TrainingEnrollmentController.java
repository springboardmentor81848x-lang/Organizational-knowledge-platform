package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.TrainingEnrollment;
import com.team7.knowledge_gap_platform.repository.TrainingEnrollmentRepository;

@RestController
@RequestMapping("/training-enrollments")
public class TrainingEnrollmentController {

    private final TrainingEnrollmentRepository trainingEnrollmentRepository;

    public TrainingEnrollmentController(TrainingEnrollmentRepository trainingEnrollmentRepository) {
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
    }

    @PostMapping
    public ResponseEntity<TrainingEnrollment> enrollInTraining(@RequestBody TrainingEnrollment request) {
        if (request.getEnrolledAt() == null) {
            request.setEnrolledAt(LocalDateTime.now());
        }
        if (request.getProgressPercentage() == null) {
            request.setProgressPercentage(0);
        }
        if (request.getStatus() == null) {
            request.setStatus("IN_PROGRESS");
        }
        return ResponseEntity.ok(trainingEnrollmentRepository.save(request));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TrainingEnrollment>> getEmployeeEnrollments(@PathVariable Long employeeId) {
        List<TrainingEnrollment> list = trainingEnrollmentRepository.findByEmployeeId(employeeId);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<TrainingEnrollment> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        return trainingEnrollmentRepository.findById(id).map(enrollment -> {
            Integer progress = body.get("progressPercentage");
            if (progress != null) {
                enrollment.setProgressPercentage(progress);
                if (progress >= 100) {
                    enrollment.setStatus("COMPLETED");
                    enrollment.setCompletedAt(LocalDateTime.now());
                }
            }
            return ResponseEntity.ok(trainingEnrollmentRepository.save(enrollment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<TrainingEnrollment> markComplete(@PathVariable Long id) {
        return trainingEnrollmentRepository.findById(id).map(enrollment -> {
            enrollment.setProgressPercentage(100);
            enrollment.setStatus("COMPLETED");
            enrollment.setCompletedAt(LocalDateTime.now());
            return ResponseEntity.ok(trainingEnrollmentRepository.save(enrollment));
        }).orElse(ResponseEntity.notFound().build());
    }
}
