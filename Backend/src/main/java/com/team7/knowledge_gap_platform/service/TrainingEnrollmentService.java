package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.TrainingEnrollment;
import com.team7.knowledge_gap_platform.repository.TrainingEnrollmentRepository;

@Service
public class TrainingEnrollmentService {

    private final TrainingEnrollmentRepository repository;
    private final NotificationService notificationService;

    public TrainingEnrollmentService(
            TrainingEnrollmentRepository repository,
            NotificationService notificationService) {

        this.repository = repository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // ENROLL TRAINING
    // =========================================================

    public TrainingEnrollment enroll(
            TrainingEnrollment enrollment) {

        // Check duplicate enrollment
        List<TrainingEnrollment> existing =
                repository.findByEmployeeId(
                        enrollment.getEmployeeId());

        for (TrainingEnrollment e : existing) {

            if (e.getTrainingId()
                    .equals(enrollment.getTrainingId())
                    && !"CANCELLED"
                    .equalsIgnoreCase(
                            e.getStatus())) {

                throw new RuntimeException(
                        "You are already enrolled in this training");
            }
        }

        enrollment.setStatus("ENROLLED");
        enrollment.setProgressPercentage(0);
        enrollment.setEnrolledAt(
                LocalDateTime.now());
        enrollment.setCompletedAt(null);

        TrainingEnrollment savedEnrollment =
                repository.save(enrollment);

        // Automatic notification
        notificationService.createNotification(
                savedEnrollment.getEmployeeId(),
                "Training Enrollment",
                "You have successfully enrolled in training ID "
                        + savedEnrollment.getTrainingId()
                        + ".",
                "TRAINING"
        );

        return savedEnrollment;
    }

    // =========================================================
    // UPDATE TRAINING PROGRESS
    // =========================================================

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

        enrollment.setProgressPercentage(
                progressPercentage);

        // -----------------------------------------------------
        // COMPLETED
        // -----------------------------------------------------

        if (progressPercentage == 100) {

            enrollment.setStatus(
                    "COMPLETED");

            enrollment.setCompletedAt(
                    LocalDateTime.now());

        }

        // -----------------------------------------------------
        // IN PROGRESS
        // -----------------------------------------------------

        else if (progressPercentage > 0) {

            enrollment.setStatus(
                    "IN_PROGRESS");

            enrollment.setCompletedAt(null);

        }

        // -----------------------------------------------------
        // ZERO PROGRESS
        // -----------------------------------------------------

        else {

            enrollment.setStatus(
                    "ENROLLED");

            enrollment.setCompletedAt(null);
        }

        TrainingEnrollment savedEnrollment =
                repository.save(enrollment);

        // =====================================================
        // AUTOMATIC NOTIFICATIONS
        // =====================================================

        if (progressPercentage == 100) {

            notificationService.createNotification(
                    savedEnrollment.getEmployeeId(),
                    "Training Completed",
                    "You have successfully completed training ID "
                            + savedEnrollment.getTrainingId()
                            + ".",
                    "TRAINING"
            );

        } else if (progressPercentage > 0) {

            notificationService.createNotification(
                    savedEnrollment.getEmployeeId(),
                    "Training Progress Updated",
                    "Your training progress is now "
                            + progressPercentage
                            + "%.",
                    "TRAINING"
            );
        }

        return savedEnrollment;
    }

    // =========================================================
    // COMPLETE TRAINING
    // =========================================================

    public TrainingEnrollment completeTraining(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollment(enrollmentId);

        enrollment.setProgressPercentage(100);
        enrollment.setStatus("COMPLETED");
        enrollment.setCompletedAt(
                LocalDateTime.now());

        TrainingEnrollment savedEnrollment =
                repository.save(enrollment);

        // Automatic notification
        notificationService.createNotification(
                savedEnrollment.getEmployeeId(),
                "Training Completed",
                "You have successfully completed training ID "
                        + savedEnrollment.getTrainingId()
                        + ".",
                "TRAINING"
        );

        return savedEnrollment;
    }

    // =========================================================
    // CANCEL TRAINING
    // =========================================================

    public TrainingEnrollment cancelEnrollment(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollment(enrollmentId);

        enrollment.setStatus(
                "CANCELLED");

        TrainingEnrollment savedEnrollment =
                repository.save(enrollment);

        // Automatic notification
        notificationService.createNotification(
                savedEnrollment.getEmployeeId(),
                "Training Cancelled",
                "Your enrollment for training ID "
                        + savedEnrollment.getTrainingId()
                        + " has been cancelled.",
                "TRAINING"
        );

        return savedEnrollment;
    }

    // =========================================================
    // GET ENROLLMENT
    // =========================================================

    public TrainingEnrollment getEnrollment(
            Long id) {

        return repository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Training enrollment not found"));
    }

    // =========================================================
    // GET BY EMPLOYEE
    // =========================================================

    public List<TrainingEnrollment> getByEmployee(
            Long employeeId) {

        return repository
                .findByEmployeeId(
                        employeeId);
    }

    // =========================================================
    // GET BY TRAINING
    // =========================================================

    public List<TrainingEnrollment> getByTraining(
            Long trainingId) {

        return repository
                .findByTrainingId(
                        trainingId);
    }
}