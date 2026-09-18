package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.TrainingAdoptionDTO;
import com.knowledgegap.dto.TrainingAdoptionDTO.CourseAdoptionItemDTO;
import com.knowledgegap.entity.Department;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@Service
public class TrainingAdoptionService {

    private final EmployeeRepository employeeRepository;
    private final TrainingEnrollmentRepository enrollmentRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TrainingAdoptionService(
            EmployeeRepository employeeRepository,
            TrainingEnrollmentRepository enrollmentRepository) {

        this.employeeRepository = employeeRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // =========================================================
    // GET TRAINING ADOPTION
    // =========================================================

    @Transactional(readOnly = true)
    public TrainingAdoptionDTO getTrainingAdoption(
            String employeeIdentifier) {

        // -----------------------------------------------------
        // FIND DEPARTMENT HEAD
        // -----------------------------------------------------

        Employee departmentHead =
                employeeRepository
                        .findByEmployeeId(employeeIdentifier)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );

        // -----------------------------------------------------
        // VALIDATE DEPARTMENT
        // -----------------------------------------------------

        Department department =
                departmentHead.getDepartment();

        if (department == null) {
            throw new IllegalStateException(
                    "Department Head is not assigned to a department."
            );
        }

        Long departmentId =
                department.getId();

        // -----------------------------------------------------
        // GET DEPARTMENT EMPLOYEES
        // -----------------------------------------------------

        List<Employee> employees =
                employeeRepository
                        .findByDepartmentId(departmentId);

        long totalEmployees =
                employees.size();

        // -----------------------------------------------------
        // GET TRAINING ENROLLMENTS
        // -----------------------------------------------------

        List<TrainingEnrollment> enrollments =
                enrollmentRepository
                        .findByEmployeeDepartmentId(departmentId);

        // -----------------------------------------------------
        // FIND UNIQUE EMPLOYEES WITH TRAINING
        // -----------------------------------------------------

        Set<Long> enrolledEmployeeIds =
                new HashSet<>();

        for (TrainingEnrollment enrollment : enrollments) {

            if (enrollment.getEmployee() != null &&
                    enrollment.getEmployee().getId() != null) {

                enrolledEmployeeIds.add(
                        enrollment.getEmployee().getId()
                );
            }
        }

        long enrolledEmployees =
                enrolledEmployeeIds.size();

        // -----------------------------------------------------
        // ADOPTION RATE
        // -----------------------------------------------------

        double adoptionRate = 0.0;

        if (totalEmployees > 0) {

            adoptionRate =
                    ((double) enrolledEmployees
                            / totalEmployees)
                            * 100.0;
        }

        adoptionRate =
                Math.round(adoptionRate * 100.0) / 100.0;

        // -----------------------------------------------------
        // STATUS COUNTS
        // -----------------------------------------------------

        long notStarted = 0;
        long inProgress = 0;
        long completed = 0;
        long certified = 0;

        for (TrainingEnrollment enrollment : enrollments) {

            TrainingStatus status =
                    enrollment.getStatus();

            if (status == null) {
                continue;
            }

            if (status == TrainingStatus.NOT_STARTED) {

                notStarted++;

            } else if (status == TrainingStatus.IN_PROGRESS) {

                inProgress++;

            } else if (status == TrainingStatus.COMPLETED) {

                completed++;

            } else if (status == TrainingStatus.CERTIFIED) {

                certified++;
            }
        }

        // -----------------------------------------------------
        // GROUP ENROLLMENTS BY COURSE
        // -----------------------------------------------------

        Map<Long, List<TrainingEnrollment>>
                courseEnrollments =
                new HashMap<>();

        for (TrainingEnrollment enrollment : enrollments) {

            if (enrollment.getCourse() == null ||
                    enrollment.getCourse().getId() == null) {

                continue;
            }

            Long courseId =
                    enrollment.getCourse().getId();

            courseEnrollments
                    .computeIfAbsent(
                            courseId,
                            key -> new ArrayList<>()
                    )
                    .add(enrollment);
        }

        // -----------------------------------------------------
        // COURSE DETAILS
        // -----------------------------------------------------

        List<CourseAdoptionItemDTO> courseItems =
                new ArrayList<>();

        for (Map.Entry<Long, List<TrainingEnrollment>>
                entry : courseEnrollments.entrySet()) {

            List<TrainingEnrollment> courseList =
                    entry.getValue();

            if (courseList.isEmpty()) {
                continue;
            }

            TrainingEnrollment firstEnrollment =
                    courseList.get(0);

            var course =
                    firstEnrollment.getCourse();

            long courseEnrolled =
                    courseList.size();

            long courseCompleted =
                    courseList.stream()
                            .filter(enrollment ->
                                    enrollment.getStatus()
                                            == TrainingStatus.COMPLETED
                                    ||
                                    enrollment.getStatus()
                                            == TrainingStatus.CERTIFIED
                            )
                            .count();

            // -------------------------------------------------
            // COURSE ADOPTION
            // -------------------------------------------------

            double courseAdoption = 0.0;

            if (totalEmployees > 0) {

                courseAdoption =
                        ((double) courseEnrolled
                                / totalEmployees)
                                * 100.0;
            }

            courseAdoption =
                    Math.min(courseAdoption, 100.0);

            courseAdoption =
                    Math.round(
                            courseAdoption * 100.0
                    ) / 100.0;

            // -------------------------------------------------
            // COURSE COMPLETION
            // -------------------------------------------------

            double completionPercentage = 0.0;

            if (courseEnrolled > 0) {

                completionPercentage =
                        ((double) courseCompleted
                                / courseEnrolled)
                                * 100.0;
            }

            completionPercentage =
                    Math.round(
                            completionPercentage * 100.0
                    ) / 100.0;

            // -------------------------------------------------
            // CREATE COURSE DTO
            // -------------------------------------------------

            CourseAdoptionItemDTO item =
                    new CourseAdoptionItemDTO();

            item.setCourseId(course.getId());

            item.setCourseTitle(
                    course.getTitle()
            );

            if (course.getSkill() != null) {

                item.setSkillName(
                        course.getSkill().getSkillName()
                );
            }

            item.setEnrolledEmployees(
                    courseEnrolled
            );

            item.setCompletedEmployees(
                    courseCompleted
            );

            item.setAdoptionPercentage(
                    courseAdoption
            );

            item.setCompletionPercentage(
                    completionPercentage
            );

            courseItems.add(item);
        }

        // -----------------------------------------------------
        // SORT COURSES
        // HIGHEST ADOPTION FIRST
        // -----------------------------------------------------

        courseItems.sort(
                Comparator.comparingDouble(
                        CourseAdoptionItemDTO
                                ::getAdoptionPercentage
                ).reversed()
        );

        // -----------------------------------------------------
        // CREATE DASHBOARD DTO
        // -----------------------------------------------------

        TrainingAdoptionDTO dashboard =
                new TrainingAdoptionDTO();

        dashboard.setTotalEmployees(
                totalEmployees
        );

        dashboard.setEnrolledEmployees(
                enrolledEmployees
        );

        dashboard.setAdoptionRate(
                adoptionRate
        );

        dashboard.setTotalEnrollments(
                enrollments.size()
        );

        dashboard.setNotStartedEnrollments(
                notStarted
        );

        dashboard.setInProgressEnrollments(
                inProgress
        );

        dashboard.setCompletedEnrollments(
                completed
        );

        dashboard.setCertifiedEnrollments(
                certified
        );

        dashboard.setCourses(
                courseItems
        );

        return dashboard;
    }
}