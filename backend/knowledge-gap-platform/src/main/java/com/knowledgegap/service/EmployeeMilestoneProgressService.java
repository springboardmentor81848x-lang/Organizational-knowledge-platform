package com.knowledgegap.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeMilestoneProgress;
import com.knowledgegap.entity.LearningMilestone;
import com.knowledgegap.entity.LearningProgress;
import com.knowledgegap.entity.LearningProgressHistory;
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
    private final LearningProgressHistoryService learningProgressHistoryService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EmployeeMilestoneProgressService(
            EmployeeMilestoneProgressRepository progressRepository,
            LearningMilestoneRepository milestoneRepository,
            TrainingEnrollmentRepository enrollmentRepository,
            LearningProgressRepository learningProgressRepository,
            EmployeeService employeeService,
            CourseService courseService,
            LearningProgressHistoryService learningProgressHistoryService) {

        this.progressRepository = progressRepository;
        this.milestoneRepository = milestoneRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.learningProgressRepository = learningProgressRepository;
        this.employeeService = employeeService;
        this.courseService = courseService;
        this.learningProgressHistoryService =
                learningProgressHistoryService;
    }

    // =========================================================
    // INITIALIZE EMPLOYEE MILESTONES
    // =========================================================

    /**
     * Creates EmployeeMilestoneProgress records for every
     * milestone belonging to the course.
     *
     * Existing records are not duplicated.
     */
    @Transactional
    public void initializeEmployeeMilestones(
            Employee employee,
            Course course) {

        List<LearningMilestone> milestones =
                milestoneRepository
                        .findByCourseOrderByMilestoneOrderAsc(course);

        if (milestones == null || milestones.isEmpty()) {
            return;
        }

        for (LearningMilestone milestone : milestones) {

            boolean exists =
                    progressRepository
                            .findByEmployeeAndMilestone(
                                    employee,
                                    milestone
                            )
                            .isPresent();

            if (exists) {
                continue;
            }

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
    // GET ALL EMPLOYEE MILESTONE PROGRESS
    // =========================================================

    @Transactional(readOnly = true)
    public List<EmployeeMilestoneProgress>
    getEmployeeMilestoneProgress(
            String employeeIdentifier) {

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

        return progressRepository
                .findByEmployee(employee);
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

        if (progressPercentage < 0 ||
                progressPercentage > 100) {

            throw new IllegalArgumentException(
                    "Progress must be between 0 and 100."
            );
        }

        EmployeeMilestoneProgress progress =
                getById(id);

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
        // RECALCULATE COURSE PROGRESS
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

        // -----------------------------------------------------
        // RECALCULATE COURSE PROGRESS
        // -----------------------------------------------------

        recalculateOverallProgress(
                progress.getEmployee(),
                progress.getMilestone().getCourse()
        );

        return saved;
    }

    // =========================================================
    // RESET MILESTONE
    // =========================================================

    @Transactional
    public EmployeeMilestoneProgress resetMilestone(
            Long id) {

        EmployeeMilestoneProgress progress =
                getById(id);

        progress.setProgressPercentage(0);

        progress.setStatus(
                TrainingStatus.NOT_STARTED
        );

        EmployeeMilestoneProgress saved =
                progressRepository.save(progress);

        // -----------------------------------------------------
        // RECALCULATE COURSE PROGRESS
        // -----------------------------------------------------

        recalculateOverallProgress(
                progress.getEmployee(),
                progress.getMilestone().getCourse()
        );

        return saved;
    }

    // =========================================================
    // CALCULATE COURSE PROGRESS
    // =========================================================

    @Transactional(readOnly = true)
    public int calculateCourseProgress(
            Employee employee,
            Course course) {

        List<EmployeeMilestoneProgress> milestones =
                progressRepository
                        .findByEmployeeAndMilestone_CourseOrderByMilestone_MilestoneOrderAsc(
                                employee,
                                course
                        );

        if (milestones == null ||
                milestones.isEmpty()) {

            return 0;
        }

        int totalProgress = 0;

        for (EmployeeMilestoneProgress progress :
                milestones) {

            if (progress.getProgressPercentage() != null) {

                totalProgress +=
                        progress.getProgressPercentage();
            }
        }

        return Math.round(
                (float) totalProgress /
                        milestones.size()
        );
    }

    // =========================================================
    // RECALCULATE OVERALL COURSE PROGRESS
    // =========================================================

    @Transactional
    private void recalculateOverallProgress(
            Employee employee,
            Course course) {

        // -----------------------------------------------------
        // GET EMPLOYEE MILESTONES
        // -----------------------------------------------------

        List<EmployeeMilestoneProgress> milestones =
                progressRepository
                        .findByEmployeeAndMilestone_CourseOrderByMilestone_MilestoneOrderAsc(
                                employee,
                                course
                        );

        if (milestones == null ||
                milestones.isEmpty()) {

            return;
        }

        // -----------------------------------------------------
        // CALCULATE AVERAGE PROGRESS
        // -----------------------------------------------------

        int totalProgress = 0;

        for (EmployeeMilestoneProgress progress :
                milestones) {

            Integer percentage =
                    progress.getProgressPercentage();

            if (percentage != null) {

                totalProgress += percentage;
            }
        }

        int overallProgress =
                Math.round(
                        (float) totalProgress /
                                milestones.size()
                );

        // =====================================================
        // UPDATE LEARNING PROGRESS
        // =====================================================

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
                            newProgress.setProgressPercentage(0);

                            return newProgress;
                        });

        learningProgress.setProgressPercentage(
                overallProgress
        );

        learningProgressRepository.save(
                learningProgress
        );

        // =====================================================
        // UPDATE TRAINING ENROLLMENT
        // =====================================================

        List<TrainingEnrollment> enrollments =
                enrollmentRepository
                        .findByEmployee(employee);

        TrainingEnrollment matchingEnrollment = null;

        for (TrainingEnrollment enrollment :
                enrollments) {

            if (enrollment.getCourse() == null ||
                    enrollment.getCourse().getId() == null) {

                continue;
            }

            if (!enrollment.getCourse()
                    .getId()
                    .equals(course.getId())) {

                continue;
            }

            matchingEnrollment = enrollment;

            // -------------------------------------------------
            // SET OVERALL PROGRESS
            // -------------------------------------------------

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

                if (enrollment.getStartDate() == null) {

                    enrollment.setStartDate(
                            LocalDate.now()
                    );
                }

                if (enrollment.getActualCompletionDate() == null) {

                    enrollment.setActualCompletionDate(
                            LocalDate.now()
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

                if (enrollment.getStartDate() == null) {

                    enrollment.setStartDate(
                            LocalDate.now()
                    );
                }

                // If a completed milestone was reset,
                // remove the completion date.

                enrollment.setActualCompletionDate(null);
            }

            // -------------------------------------------------
            // NOT STARTED
            // -------------------------------------------------

            else {

                enrollment.setStatus(
                        TrainingStatus.NOT_STARTED
                );

                enrollment.setActualCompletionDate(null);
            }

            enrollmentRepository.save(enrollment);

            break;
        }

        // =====================================================
        // RECORD LEARNING PROGRESS HISTORY
        // =====================================================

        /*
         * This is what feeds the Learning Progress
         * analytics line chart.
         *
         * Example:
         *
         * 0%  → 11% → 22% → 33% → 100%
         *
         * Every milestone update creates a history
         * record with the current overall course progress.
         */

        if (matchingEnrollment != null) {

            learningProgressHistoryService.recordProgress(
                    employee,
                    course,
                    matchingEnrollment,
                    overallProgress
            );
        }
    }
}