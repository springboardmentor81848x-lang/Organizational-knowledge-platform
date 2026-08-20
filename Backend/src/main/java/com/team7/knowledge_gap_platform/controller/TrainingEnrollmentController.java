package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.TrainingEnrollment;
import com.team7.knowledge_gap_platform.service.TrainingEnrollmentService;

@RestController
@RequestMapping("/training-enrollments")
public class TrainingEnrollmentController {

    private final TrainingEnrollmentService service;

    public TrainingEnrollmentController(
            TrainingEnrollmentService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TrainingEnrollment> enroll(
            @RequestBody TrainingEnrollment enrollment) {

        return ResponseEntity.ok(
                service.enroll(enrollment));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<TrainingEnrollment> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {

        return ResponseEntity.ok(
                service.updateProgress(
                        id,
                        body.get("progressPercentage")));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<TrainingEnrollment> complete(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.completeTraining(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<TrainingEnrollment> cancel(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.cancelEnrollment(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TrainingEnrollment> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getEnrollment(id));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<TrainingEnrollment>> getByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                service.getByEmployee(employeeId));
    }

    @GetMapping("/training/{trainingId}")
    public ResponseEntity<List<TrainingEnrollment>> getByTraining(
            @PathVariable Long trainingId) {

        return ResponseEntity.ok(
                service.getByTraining(trainingId));
    }
}