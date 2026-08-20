package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.TrainingEnrollment;
import com.team7.knowledge_gap_platform.repository.TrainingEnrollmentRepository;

@Service
public class TrainingEnrollmentService {

    private final TrainingEnrollmentRepository repository;

    public TrainingEnrollmentService(
            TrainingEnrollmentRepository repository) {
        this.repository = repository;
    }

    public TrainingEnrollment enroll(
            TrainingEnrollment enrollment) {

        enrollment.setStatus("ENROLLED");
        enrollment.setProgressPercentage(0);
        enrollment.setEnrolledAt(LocalDateTime.now());
        enrollment.setCompletedAt(null);

        return repository.save(enrollment);
    }

    public TrainingEnrollment updateProgress(
            Long enrollmentId,
            Integer progressPercentage) {

        if (progressPercentage == null
                || progressPercentage < 0
                || progressPercentage > 100) {
            throw new RuntimeException(
                    "Progress must be between 0 and 100");
        }

        TrainingEnrollment enrollment =
                getEnrollment(enrollmentId);

        enrollment.setProgressPercentage(progressPercentage);

        if (progressPercentage == 100) {
            enrollment.setStatus("COMPLETED");
            enrollment.setCompletedAt(LocalDateTime.now());
        } else if (progressPercentage > 0) {
            enrollment.setStatus("IN_PROGRESS");
            enrollment.setCompletedAt(null);
        }

        return repository.save(enrollment);
    }

    public TrainingEnrollment completeTraining(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollment(enrollmentId);

        enrollment.setProgressPercentage(100);
        enrollment.setStatus("COMPLETED");
        enrollment.setCompletedAt(LocalDateTime.now());

        return repository.save(enrollment);
    }

    public TrainingEnrollment cancelEnrollment(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollment(enrollmentId);

        enrollment.setStatus("CANCELLED");

        return repository.save(enrollment);
    }

    public TrainingEnrollment getEnrollment(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Training enrollment not found"));
    }

    public List<TrainingEnrollment> getByEmployee(
            Long employeeId) {

        return repository.findByEmployeeId(employeeId);
    }

    public List<TrainingEnrollment> getByTraining(
            Long trainingId) {

        return repository.findByTrainingId(trainingId);
    }
}