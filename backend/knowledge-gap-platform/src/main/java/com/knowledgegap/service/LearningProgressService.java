package com.knowledgegap.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.LearningProgress;
import com.knowledgegap.repository.CourseRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.LearningProgressRepository;

@Service
public class LearningProgressService {

    private final LearningProgressRepository learningProgressRepository;

    private final EmployeeRepository employeeRepository;

    private final CourseRepository courseRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public LearningProgressService(
            LearningProgressRepository learningProgressRepository,
            EmployeeRepository employeeRepository,
            CourseRepository courseRepository) {

        this.learningProgressRepository =
                learningProgressRepository;

        this.employeeRepository =
                employeeRepository;

        this.courseRepository =
                courseRepository;
    }

    // =========================================================
    // GET ALL EMPLOYEE LEARNING PROGRESS
    // =========================================================

    @Transactional(readOnly = true)
    public List<LearningProgress> getEmployeeProgress(
            String employeeIdentifier) {

        Employee employee =
                employeeRepository
                        .findByEmployeeId(employeeIdentifier)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );

        return learningProgressRepository
                .findByEmployee(employee);
    }

    // =========================================================
    // GET PROGRESS FOR EMPLOYEE + COURSE
    // =========================================================

    @Transactional(readOnly = true)
    public LearningProgress getEmployeeCourseProgress(
            String employeeIdentifier,
            Long courseId) {

        Employee employee =
                employeeRepository
                        .findByEmployeeId(employeeIdentifier)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );

        Course course =
                courseRepository
                        .findById(courseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Course not found: "
                                                + courseId
                                )
                        );

        return learningProgressRepository
                .findByEmployeeAndCourse(
                        employee,
                        course
                )
                .orElseGet(() -> {

                    LearningProgress progress =
                            new LearningProgress();

                    progress.setEmployee(employee);
                    progress.setCourse(course);
                    progress.setProgressPercentage(0);

                    return learningProgressRepository.save(
                            progress
                    );
                });
    }

    // =========================================================
    // CREATE INITIAL LEARNING PROGRESS
    // =========================================================

    @Transactional
    public LearningProgress initializeProgress(
            Employee employee,
            Course course) {

        return learningProgressRepository
                .findByEmployeeAndCourse(
                        employee,
                        course
                )
                .orElseGet(() -> {

                    LearningProgress progress =
                            new LearningProgress();

                    progress.setEmployee(employee);
                    progress.setCourse(course);
                    progress.setProgressPercentage(0);

                    return learningProgressRepository.save(
                            progress
                    );
                });
    }

    // =========================================================
    // UPDATE OVERALL PROGRESS
    // =========================================================
    /*
     * Normally this method should NOT be called directly
     * from the employee UI.
     *
     * Overall progress should come from:
     *
     * EmployeeMilestoneProgress
     *          ↓
     * Average milestone progress
     *          ↓
     * LearningProgress
     *
     * This method is kept for backend/internal use.
     */

    @Transactional
    public LearningProgress updateProgress(
            Long id,
            Integer progressPercentage) {

        if (progressPercentage == null) {

            throw new IllegalArgumentException(
                    "Progress percentage is required."
            );
        }

        if (
            progressPercentage < 0 ||
            progressPercentage > 100
        ) {

            throw new IllegalArgumentException(
                    "Progress must be between 0 and 100."
            );
        }

        LearningProgress progress =
                learningProgressRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Learning progress not found: "
                                                + id
                                )
                        );

        progress.setProgressPercentage(
                progressPercentage
        );

        return learningProgressRepository.save(
                progress
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public LearningProgress getById(
            Long id) {

        return learningProgressRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Learning progress not found: "
                                        + id
                        )
                );
    }
}