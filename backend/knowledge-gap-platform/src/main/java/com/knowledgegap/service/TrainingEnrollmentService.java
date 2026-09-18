package com.knowledgegap.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Course;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@Service
public class TrainingEnrollmentService {

    private final TrainingEnrollmentRepository enrollmentRepository;

    private final EmployeeService employeeService;

    private final CourseService courseService;

    private final EmployeeMilestoneProgressService
            employeeMilestoneProgressService;

    private final LearningProgressService
            learningProgressService;

    private final LearningProgressHistoryService
            learningProgressHistoryService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TrainingEnrollmentService(
            TrainingEnrollmentRepository enrollmentRepository,
            EmployeeService employeeService,
            CourseService courseService,
            EmployeeMilestoneProgressService
                    employeeMilestoneProgressService,
            LearningProgressService
                    learningProgressService,
            LearningProgressHistoryService
                    learningProgressHistoryService) {

        this.enrollmentRepository = enrollmentRepository;
        this.employeeService = employeeService;
        this.courseService = courseService;
        this.employeeMilestoneProgressService =
                employeeMilestoneProgressService;
        this.learningProgressService =
                learningProgressService;
        this.learningProgressHistoryService =
                learningProgressHistoryService;
    }

    // =========================================================
    // ENROLL EMPLOYEE
    // =========================================================

    @Transactional
    public TrainingEnrollment enrollEmployee(
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

        // -----------------------------------------------------
        // CHECK DUPLICATE
        // -----------------------------------------------------

        if (enrollmentRepository
                .findByEmployeeAndCourse(
                        employee,
                        course
                )
                .isPresent()) {

            throw new IllegalStateException(
                    "Employee is already enrolled in this course."
            );
        }

        // -----------------------------------------------------
        // CREATE ENROLLMENT
        // -----------------------------------------------------

        TrainingEnrollment enrollment =
                new TrainingEnrollment();

        enrollment.setEmployee(employee);
        enrollment.setCourse(course);

        enrollment.setStatus(
                TrainingStatus.NOT_STARTED
        );

        enrollment.setProgressPercentage(0);

        TrainingEnrollment savedEnrollment =
                enrollmentRepository.save(enrollment);

        // -----------------------------------------------------
        // INITIALIZE LEARNING PROGRESS
        // -----------------------------------------------------

        learningProgressService.initializeProgress(
                employee,
                course
        );

        // -----------------------------------------------------
        // INITIALIZE EMPLOYEE MILESTONES
        // -----------------------------------------------------

        employeeMilestoneProgressService
                .initializeEmployeeMilestones(
                        employee,
                        course
                );

        return savedEnrollment;
    }

    // =========================================================
    // GET EMPLOYEE ENROLLMENTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<TrainingEnrollment>
    getEmployeeEnrollments(
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

        return enrollmentRepository
                .findByEmployee(employee);
    }

    // =========================================================
    // GET SINGLE ENROLLMENT
    // =========================================================

    @Transactional(readOnly = true)
    public TrainingEnrollment getEnrollmentById(
            Long enrollmentId) {

        return enrollmentRepository
                .findById(enrollmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Training enrollment not found with id: "
                                        + enrollmentId
                        )
                );
    }

    // =========================================================
    // START TRAINING
    // =========================================================

    @Transactional
    public TrainingEnrollment startTraining(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollmentById(enrollmentId);

        if (
                enrollment.getStatus() ==
                        TrainingStatus.COMPLETED
                        ||
                enrollment.getStatus() ==
                        TrainingStatus.CERTIFIED
        ) {

            throw new IllegalStateException(
                    "This training has already been completed."
            );
        }

        Employee employee =
                enrollment.getEmployee();

        Course course =
                enrollment.getCourse();

        // -----------------------------------------------------
        // ENSURE MILESTONES EXIST
        // -----------------------------------------------------

        employeeMilestoneProgressService
                .initializeEmployeeMilestones(
                        employee,
                        course
                );

        // -----------------------------------------------------
        // ENSURE LEARNING PROGRESS EXISTS
        // -----------------------------------------------------

        learningProgressService.initializeProgress(
                employee,
                course
        );

        // -----------------------------------------------------
        // SET START DATE
        // -----------------------------------------------------

        if (enrollment.getStartDate() == null) {

            enrollment.setStartDate(
                    LocalDate.now()
            );
        }

        // -----------------------------------------------------
        // SET STATUS
        // -----------------------------------------------------

        enrollment.setStatus(
                TrainingStatus.IN_PROGRESS
        );

        TrainingEnrollment savedEnrollment =
                enrollmentRepository.save(enrollment);

        // -----------------------------------------------------
        // RECORD INITIAL LEARNING HISTORY
        // -----------------------------------------------------

        learningProgressHistoryService.recordProgress(
                employee,
                course,
                savedEnrollment,
                savedEnrollment.getProgressPercentage()
        );

        return savedEnrollment;
    }

    // =========================================================
    // UPDATE OVERALL PROGRESS
    // =========================================================

    @Transactional
    public TrainingEnrollment updateProgress(
            Long enrollmentId,
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

        TrainingEnrollment enrollment =
                getEnrollmentById(enrollmentId);

        if (
                enrollment.getStatus() ==
                        TrainingStatus.CERTIFIED
        ) {

            throw new IllegalStateException(
                    "Certified training cannot be modified."
            );
        }

        Employee employee =
                enrollment.getEmployee();

        Course course =
                enrollment.getCourse();

        // -----------------------------------------------------
        // SET PROGRESS
        // -----------------------------------------------------

        enrollment.setProgressPercentage(
                progressPercentage
        );

        // -----------------------------------------------------
        // COMPLETED
        // -----------------------------------------------------

        if (progressPercentage == 100) {

            enrollment.setStatus(
                    TrainingStatus.COMPLETED
            );

            enrollment.setActualCompletionDate(
                    LocalDate.now()
            );
        }

        // -----------------------------------------------------
        // IN PROGRESS
        // -----------------------------------------------------

        else if (progressPercentage > 0) {

            enrollment.setStatus(
                    TrainingStatus.IN_PROGRESS
            );

            if (enrollment.getStartDate() == null) {

                enrollment.setStartDate(
                        LocalDate.now()
                );
            }
        }

        // -----------------------------------------------------
        // NOT STARTED
        // -----------------------------------------------------

        else {

            enrollment.setStatus(
                    TrainingStatus.NOT_STARTED
            );
        }

        TrainingEnrollment savedEnrollment =
                enrollmentRepository.save(enrollment);

        // -----------------------------------------------------
        // RECORD LEARNING HISTORY
        // -----------------------------------------------------

        learningProgressHistoryService.recordProgress(
                employee,
                course,
                savedEnrollment,
                progressPercentage
        );

        return savedEnrollment;
    }

    // =========================================================
    // COMPLETE TRAINING
    // =========================================================

    @Transactional
    public TrainingEnrollment completeTraining(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollmentById(enrollmentId);

        if (
                enrollment.getStatus() ==
                        TrainingStatus.CERTIFIED
        ) {

            throw new IllegalStateException(
                    "Certified training cannot be modified."
            );
        }

        Employee employee =
                enrollment.getEmployee();

        Course course =
                enrollment.getCourse();

        // -----------------------------------------------------
        // SET COMPLETION
        // -----------------------------------------------------

        enrollment.setProgressPercentage(100);

        enrollment.setStatus(
                TrainingStatus.COMPLETED
        );

        if (enrollment.getStartDate() == null) {

            enrollment.setStartDate(
                    LocalDate.now()
            );
        }

        enrollment.setActualCompletionDate(
                LocalDate.now()
        );

        TrainingEnrollment savedEnrollment =
                enrollmentRepository.save(enrollment);

        // -----------------------------------------------------
        // RECORD COMPLETION HISTORY
        // -----------------------------------------------------

        learningProgressHistoryService.recordProgress(
                employee,
                course,
                savedEnrollment,
                100
        );

        return savedEnrollment;
    }

    // =========================================================
    // MARK CERTIFIED
    // =========================================================

    @Transactional
    public TrainingEnrollment markCertified(
            Long enrollmentId,
            String certificationName,
            LocalDate certificationExpiryDate,
            String certificationUrl) {

        TrainingEnrollment enrollment =
                getEnrollmentById(enrollmentId);

        // -----------------------------------------------------
        // MUST BE COMPLETED FIRST
        // -----------------------------------------------------

        if (
                enrollment.getStatus() !=
                        TrainingStatus.COMPLETED
        ) {

            throw new IllegalStateException(
                    "Training must be completed before certification."
            );
        }

        // -----------------------------------------------------
        // CERTIFICATION NAME
        // -----------------------------------------------------

        if (
                certificationName == null ||
                certificationName.trim().isEmpty()
        ) {

            throw new IllegalArgumentException(
                    "Certification name is required."
            );
        }

        // -----------------------------------------------------
        // EXPIRY DATE VALIDATION
        // -----------------------------------------------------

        if (
                certificationExpiryDate != null &&
                certificationExpiryDate.isBefore(
                        LocalDate.now()
                )
        ) {

            throw new IllegalArgumentException(
                    "Certification expiry date cannot be in the past."
            );
        }

        // -----------------------------------------------------
        // SET CERTIFICATION DETAILS
        // -----------------------------------------------------

        enrollment.setCertificationName(
                certificationName
        );

        enrollment.setCertificationIssuedDate(
                LocalDate.now()
        );

        enrollment.setCertificationExpiryDate(
                certificationExpiryDate
        );

        enrollment.setCertificationUrl(
                certificationUrl
        );

        // -----------------------------------------------------
        // SET STATUS
        // -----------------------------------------------------

        enrollment.setStatus(
                TrainingStatus.CERTIFIED
        );

        return enrollmentRepository.save(enrollment);
    }

    // =========================================================
    // MARK EXPIRED
    // =========================================================

    @Transactional
    public TrainingEnrollment markExpired(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollmentById(enrollmentId);

        if (
                enrollment.getStatus() !=
                        TrainingStatus.CERTIFIED
        ) {

            throw new IllegalStateException(
                    "Only certified training can expire."
            );
        }

        enrollment.setStatus(
                TrainingStatus.EXPIRED_RENEWAL
        );

        return enrollmentRepository.save(enrollment);
    }

    // =========================================================
    // DELETE ENROLLMENT
    // =========================================================

    @Transactional
    public void deleteEnrollment(
            Long enrollmentId) {

        if (
                !enrollmentRepository
                        .existsById(enrollmentId)
        ) {

            throw new RuntimeException(
                    "Training enrollment not found with id: "
                            + enrollmentId
            );
        }

        enrollmentRepository.deleteById(
                enrollmentId
        );
    }
}