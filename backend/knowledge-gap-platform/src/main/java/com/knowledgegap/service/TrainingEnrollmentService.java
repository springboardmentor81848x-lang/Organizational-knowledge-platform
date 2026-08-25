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

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TrainingEnrollmentService(
            TrainingEnrollmentRepository enrollmentRepository,
            EmployeeService employeeService,
            CourseService courseService,
            EmployeeMilestoneProgressService
                    employeeMilestoneProgressService) {

        this.enrollmentRepository =
                enrollmentRepository;

        this.employeeService =
                employeeService;

        this.courseService =
                courseService;

        this.employeeMilestoneProgressService =
                employeeMilestoneProgressService;
    }

    // =========================================================
    // ENROLL EMPLOYEE
    // =========================================================

    @Transactional
    public TrainingEnrollment enrollEmployee(
            String employeeIdentifier,
            Long courseId) {

        // -----------------------------------------------------
        // FIND EMPLOYEE
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // FIND COURSE
        // -----------------------------------------------------

        Course course =
                courseService.getCourseById(
                        courseId
                );

        // -----------------------------------------------------
        // CHECK DUPLICATE
        // -----------------------------------------------------

        if (
            enrollmentRepository
                    .findByEmployeeAndCourse(
                            employee,
                            course
                    )
                    .isPresent()
        ) {

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

        // -----------------------------------------------------
        // EXPECTED COMPLETION DATE
        // -----------------------------------------------------
        /*
         * Course duration is currently stored as String
         * in the Course entity.
         *
         * Therefore expected completion date is not
         * automatically calculated here.
         *
         * It can be supplied or updated later.
         */

        // -----------------------------------------------------
        // SAVE ENROLLMENT
        // -----------------------------------------------------

        TrainingEnrollment savedEnrollment =
                enrollmentRepository.save(
                        enrollment
                );

        // -----------------------------------------------------
        // INITIALIZE EMPLOYEE MILESTONES
        // -----------------------------------------------------
        /*
         * Create an employee-specific progress record
         * for every milestone belonging to this course.
         *
         * Example:
         *
         * Core Java       -> 0%
         * Collections     -> 0%
         * Multithreading  -> 0%
         * Spring Boot     -> 0%
         */

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
                getEnrollmentById(
                        enrollmentId
                );

        // -----------------------------------------------------
        // ALREADY COMPLETED / CERTIFIED
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // SET START DATE
        // -----------------------------------------------------

        if (
            enrollment.getStartDate() == null
        ) {

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

        return enrollmentRepository.save(
                enrollment
        );
    }

    // =========================================================
    // UPDATE OVERALL PROGRESS
    // =========================================================

    @Transactional
    public TrainingEnrollment updateProgress(
            Long enrollmentId,
            Integer progressPercentage) {

        // -----------------------------------------------------
        // VALIDATE
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // GET ENROLLMENT
        // -----------------------------------------------------

        TrainingEnrollment enrollment =
                getEnrollmentById(
                        enrollmentId
                );

        // -----------------------------------------------------
        // CERTIFIED CANNOT CHANGE
        // -----------------------------------------------------

        if (
            enrollment.getStatus() ==
                    TrainingStatus.CERTIFIED
        ) {

            throw new IllegalStateException(
                    "Certified training cannot be modified."
            );
        }

        // -----------------------------------------------------
        // SET PROGRESS
        // -----------------------------------------------------

        enrollment.setProgressPercentage(
                progressPercentage
        );

        // -----------------------------------------------------
        // AUTOMATIC STATUS
        // -----------------------------------------------------

        if (progressPercentage == 100) {

            enrollment.setStatus(
                    TrainingStatus.COMPLETED
            );

            enrollment.setActualCompletionDate(
                    LocalDate.now()
            );

        } else if (progressPercentage > 0) {

            enrollment.setStatus(
                    TrainingStatus.IN_PROGRESS
            );

            if (
                enrollment.getStartDate() == null
            ) {

                enrollment.setStartDate(
                        LocalDate.now()
                );
            }

        } else {

            enrollment.setStatus(
                    TrainingStatus.NOT_STARTED
            );
        }

        return enrollmentRepository.save(
                enrollment
        );
    }

    // =========================================================
    // COMPLETE TRAINING
    // =========================================================

    @Transactional
    public TrainingEnrollment completeTraining(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollmentById(
                        enrollmentId
                );

        // -----------------------------------------------------
        // CERTIFIED CHECK
        // -----------------------------------------------------

        if (
            enrollment.getStatus() ==
                    TrainingStatus.CERTIFIED
        ) {

            throw new IllegalStateException(
                    "Certified training cannot be modified."
            );
        }

        // -----------------------------------------------------
        // SET 100%
        // -----------------------------------------------------

        enrollment.setProgressPercentage(
                100
        );

        // -----------------------------------------------------
        // SET STATUS
        // -----------------------------------------------------

        enrollment.setStatus(
                TrainingStatus.COMPLETED
        );

        // -----------------------------------------------------
        // SET START DATE
        // -----------------------------------------------------

        if (
            enrollment.getStartDate() == null
        ) {

            enrollment.setStartDate(
                    LocalDate.now()
            );
        }

        // -----------------------------------------------------
        // SET COMPLETION DATE
        // -----------------------------------------------------

        enrollment.setActualCompletionDate(
                LocalDate.now()
        );

        return enrollmentRepository.save(
                enrollment
        );
    }

    // =========================================================
    // MARK CERTIFIED
    // =========================================================

    @Transactional
    public TrainingEnrollment markCertified(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollmentById(
                        enrollmentId
                );

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
        // CERTIFY
        // -----------------------------------------------------

        enrollment.setStatus(
                TrainingStatus.CERTIFIED
        );

        return enrollmentRepository.save(
                enrollment
        );
    }

    // =========================================================
    // MARK EXPIRED / RENEWAL
    // =========================================================

    @Transactional
    public TrainingEnrollment markExpiredForRenewal(
            Long enrollmentId) {

        TrainingEnrollment enrollment =
                getEnrollmentById(
                        enrollmentId
                );

        // -----------------------------------------------------
        // MARK EXPIRED
        // -----------------------------------------------------

        enrollment.setStatus(
                TrainingStatus.EXPIRED_RENEWAL
        );

        return enrollmentRepository.save(
                enrollment
        );
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