package com.knowledgegap.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeMilestoneProgress;
import com.knowledgegap.entity.LearningMilestone;
import com.knowledgegap.entity.LearningProgress;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
import com.knowledgegap.repository.EmployeeMilestoneProgressRepository;
import com.knowledgegap.repository.LearningMilestoneRepository;
import com.knowledgegap.repository.LearningProgressRepository;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@Service
public class EmployeeMilestoneProgressService {

    private final EmployeeMilestoneProgressRepository progressRepository;
    private final LearningMilestoneRepository milestoneRepository;
    private final TrainingEnrollmentRepository enrollmentRepository;
    private final LearningProgressRepository learningProgressRepository;
    private final EmployeeService employeeService;
    private final CourseService courseService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EmployeeMilestoneProgressService(
            EmployeeMilestoneProgressRepository progressRepository,
            LearningMilestoneRepository milestoneRepository,
            TrainingEnrollmentRepository enrollmentRepository,
            LearningProgressRepository learningProgressRepository,
            EmployeeService employeeService,
            CourseService courseService) {

        this.progressRepository = progressRepository;
        this.milestoneRepository = milestoneRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.learningProgressRepository = learningProgressRepository;
        this.employeeService = employeeService;
        this.courseService = courseService;
    }

    // =========================================================
    // INITIALIZE EMPLOYEE MILESTONES
    // =========================================================

    @Transactional
    public void initializeEmployeeMilestones(
            Employee employee,
            Course course) {

        List<LearningMilestone> milestones =
                milestoneRepository
                        .findByCourseOrderByMilestoneOrderAsc(
                                course
                        );

        for (LearningMilestone milestone : milestones) {

            if (
                progressRepository
                    .findByEmployeeAndMilestone(
                            employee,
                            milestone
                    )
                    .isEmpty()
            ) {

                EmployeeMilestoneProgress progress =
                        new EmployeeMilestoneProgress();

                progress.setEmployee(employee);
                progress.setMilestone(milestone);
                progress.setProgressPercentage(0);
                progress.setStatus(
                        TrainingStatus.NOT_STARTED
                );

                progressRepository.save(progress);
            }
        }
    }

    // =========================================================
    // GET EMPLOYEE COURSE MILESTONES
    // =========================================================

    @Transactional(readOnly = true)
    public List<EmployeeMilestoneProgress>
    getEmployeeCourseProgress(
            String employeeIdentifier,
            Long courseId) {

        Employee employee =
                employeeService
                        .getEmployeeByIdentifier(
                                employeeIdentifier
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );

        Course course =
                courseService.getCourseById(courseId);

        return progressRepository
                .findByEmployeeAndMilestone_CourseOrderByMilestone_MilestoneOrderAsc(
                        employee,
                        course
                );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public EmployeeMilestoneProgress getById(
            Long id) {

        return progressRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee milestone progress not found: "
                                        + id
                        )
                );
    }

    // =========================================================
    // UPDATE MILESTONE PROGRESS
    // =========================================================

    @Transactional
    public EmployeeMilestoneProgress updateProgress(
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

        EmployeeMilestoneProgress progress =
                getById(id);

        // -----------------------------------------------------
        // CERTIFIED CHECK
        // -----------------------------------------------------

        if (
            progress.getStatus() ==
                    TrainingStatus.CERTIFIED
        ) {
            throw new IllegalStateException(
                    "Certified milestone cannot be modified."
            );
        }

        // -----------------------------------------------------
        // SET PROGRESS
        // -----------------------------------------------------

        progress.setProgressPercentage(
                progressPercentage
        );

        // -----------------------------------------------------
        // AUTOMATIC STATUS
        // -----------------------------------------------------

        if (progressPercentage == 100) {

            progress.setStatus(
                    TrainingStatus.COMPLETED
            );

        } else if (progressPercentage > 0) {

            progress.setStatus(
                    TrainingStatus.IN_PROGRESS
            );

        } else {

            progress.setStatus(
                    TrainingStatus.NOT_STARTED
            );
        }

        EmployeeMilestoneProgress saved =
                progressRepository.save(progress);

        // -----------------------------------------------------
        // RECALCULATE OVERALL COURSE PROGRESS
        // -----------------------------------------------------

        recalculateOverallProgress(
                progress.getEmployee(),
                progress.getMilestone().getCourse()
        );

        return saved;
    }

    // =========================================================
    // COMPLETE MILESTONE
    // =========================================================

    @Transactional
    public EmployeeMilestoneProgress completeMilestone(
            Long id) {

        EmployeeMilestoneProgress progress =
                getById(id);

        progress.setProgressPercentage(100);

        progress.setStatus(
                TrainingStatus.COMPLETED
        );

        EmployeeMilestoneProgress saved =
                progressRepository.save(progress);

        recalculateOverallProgress(
                progress.getEmployee(),
                progress.getMilestone().getCourse()
        );

        return saved;
    }

    // =========================================================
    // RECALCULATE OVERALL COURSE PROGRESS
    // =========================================================

    private void recalculateOverallProgress(
            Employee employee,
            Course course) {

        List<EmployeeMilestoneProgress> milestones =
                progressRepository
                        .findByEmployeeAndMilestone_CourseOrderByMilestone_MilestoneOrderAsc(
                                employee,
                                course
                        );

        if (milestones.isEmpty()) {
            return;
        }

        // -----------------------------------------------------
        // CALCULATE AVERAGE
        // -----------------------------------------------------

        int totalProgress = 0;

        for (
                EmployeeMilestoneProgress progress :
                milestones
        ) {

            totalProgress +=
                    progress.getProgressPercentage() != null
                            ? progress.getProgressPercentage()
                            : 0;
        }

        int overallProgress =
                Math.round(
                        (float) totalProgress /
                                milestones.size()
                );

        // -----------------------------------------------------
        // UPDATE LEARNING PROGRESS
        // -----------------------------------------------------

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

        learningProgress.setProgressPercentage(
                overallProgress
        );

        learningProgressRepository.save(
                learningProgress
        );

        // -----------------------------------------------------
        // UPDATE TRAINING ENROLLMENT
        // -----------------------------------------------------

        List<TrainingEnrollment> enrollments =
                enrollmentRepository
                        .findByEmployee(employee);

        for (
                TrainingEnrollment enrollment :
                enrollments
        ) {

            if (
                enrollment.getCourse()
                        .getId()
                        .equals(course.getId())
            ) {

                enrollment.setProgressPercentage(
                        overallProgress
                );

                // -------------------------------------------------
                // COMPLETED
                // -------------------------------------------------

                if (overallProgress == 100) {

                    enrollment.setStatus(
                            TrainingStatus.COMPLETED
                    );

                    if (
                        enrollment
                            .getActualCompletionDate() == null
                    ) {

                        enrollment
                                .setActualCompletionDate(
                                        java.time.LocalDate.now()
                                );
                    }

                }

                // -------------------------------------------------
                // IN PROGRESS
                // -------------------------------------------------

                else if (overallProgress > 0) {

                    enrollment.setStatus(
                            TrainingStatus.IN_PROGRESS
                    );

                    if (
                        enrollment.getStartDate() == null
                    ) {

                        enrollment.setStartDate(
                                java.time.LocalDate.now()
                        );
                    }

                }

                // -------------------------------------------------
                // NOT STARTED
                // -------------------------------------------------

                else {

                    enrollment.setStatus(
                            TrainingStatus.NOT_STARTED
                    );
                }

                enrollmentRepository.save(enrollment);
            }
        }
    }
}