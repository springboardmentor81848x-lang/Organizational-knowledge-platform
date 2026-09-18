package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.LearningProgressHistory;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.repository.LearningProgressHistoryRepository;

@Service
public class LearningProgressHistoryService {

    private final LearningProgressHistoryRepository historyRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LearningProgressHistoryService(
            LearningProgressHistoryRepository historyRepository) {

        this.historyRepository = historyRepository;
    }

    // =========================================================
    // RECORD PROGRESS
    // =========================================================

    @Transactional
    public LearningProgressHistory recordProgress(
            Employee employee,
            Course course,
            TrainingEnrollment enrollment,
            Integer progressPercentage) {

        if (employee == null) {
            throw new IllegalArgumentException(
                    "Employee is required."
            );
        }

        if (course == null) {
            throw new IllegalArgumentException(
                    "Course is required."
            );
        }

        if (enrollment == null) {
            throw new IllegalArgumentException(
                    "Training enrollment is required."
            );
        }

        if (progressPercentage == null) {
            throw new IllegalArgumentException(
                    "Progress percentage is required."
            );
        }

        if (progressPercentage < 0 ||
                progressPercentage > 100) {

            throw new IllegalArgumentException(
                    "Progress must be between 0 and 100."
            );
        }

        LearningProgressHistory history =
                new LearningProgressHistory();

        history.setEmployee(employee);
        history.setCourse(course);
        history.setEnrollment(enrollment);
        history.setProgressPercentage(progressPercentage);
        history.setRecordedAt(LocalDateTime.now());

        return historyRepository.save(history);
    }

    // =========================================================
    // GET EMPLOYEE HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<LearningProgressHistory> getEmployeeHistory(
            String employeeIdentifier) {

        if (employeeIdentifier == null ||
                employeeIdentifier.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Employee identifier is required."
            );
        }

        return historyRepository
                .findByEmployee_EmployeeIdOrderByRecordedAtAsc(
                        employeeIdentifier
                );
    }

    // =========================================================
    // GET ENROLLMENT HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<LearningProgressHistory> getEnrollmentHistory(
            Long enrollmentId) {

        if (enrollmentId == null) {
            throw new IllegalArgumentException(
                    "Enrollment ID is required."
            );
        }

        return historyRepository
                .findByEnrollment_IdOrderByRecordedAtAsc(
                        enrollmentId
                );
    }

    // =========================================================
    // GET ALL HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<LearningProgressHistory> getAllHistory() {

        return historyRepository.findAll();
    }
}