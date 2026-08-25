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

    public LearningProgressService(
            LearningProgressRepository learningProgressRepository,
            EmployeeRepository employeeRepository,
            CourseRepository courseRepository) {

        this.learningProgressRepository = learningProgressRepository;
        this.employeeRepository = employeeRepository;
        this.courseRepository = courseRepository;
    }

    // =========================================================
    // GET EMPLOYEE PROGRESS
    // =========================================================

    public List<LearningProgress> getEmployeeProgress(
            String employeeIdentifier) {

        Employee employee = employeeRepository
                .findByEmployeeId(employeeIdentifier)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found: "
                                        + employeeIdentifier
                        ));

        return learningProgressRepository
                .findByEmployee(employee);
    }

    // =========================================================
    // CREATE / UPDATE PROGRESS
    // =========================================================

    @Transactional
    public LearningProgress saveProgress(
            String employeeIdentifier,
            Long courseId,
            Integer progressPercentage) {

        Employee employee = employeeRepository
                .findByEmployeeId(employeeIdentifier)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found: "
                                        + employeeIdentifier
                        ));

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Course not found: "
                                        + courseId
                        ));

        int progress = progressPercentage == null
                ? 0
                : Math.min(
                        Math.max(progressPercentage, 0),
                        100
                );

        LearningProgress learningProgress =
                learningProgressRepository
                        .findByEmployeeAndCourse(
                                employee,
                                course
                        )
                        .orElseGet(() -> {

                            LearningProgress newProgress =
                                    new LearningProgress();

                            newProgress.setEmployee(employee);
                            newProgress.setCourse(course);

                            return newProgress;
                        });

        learningProgress.setProgressPercentage(progress);

        return learningProgressRepository.save(
                learningProgress
        );
    }

    // =========================================================
    // UPDATE EXISTING PROGRESS
    // =========================================================

    @Transactional
    public LearningProgress updateProgress(
            Long id,
            Integer progressPercentage) {

        LearningProgress learningProgress =
                learningProgressRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Learning progress not found: "
                                                + id
                                ));

        int progress = progressPercentage == null
                ? 0
                : Math.min(
                        Math.max(progressPercentage, 0),
                        100
                );

        learningProgress.setProgressPercentage(progress);

        return learningProgressRepository.save(
                learningProgress
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    public LearningProgress getById(Long id) {

        return learningProgressRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Learning progress not found: "
                                        + id
                        ));
    }
}
