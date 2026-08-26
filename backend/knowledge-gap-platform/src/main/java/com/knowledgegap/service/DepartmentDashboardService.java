package com.knowledgegap.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.DepartmentDashboardDTO;
import com.knowledgegap.entity.Department;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@Service
public class DepartmentDashboardService {

    private final EmployeeRepository employeeRepository;

    private final TrainingEnrollmentRepository
            trainingEnrollmentRepository;

    private final KnowledgeGapRepository
            knowledgeGapRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public DepartmentDashboardService(
            EmployeeRepository employeeRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository,
            KnowledgeGapRepository knowledgeGapRepository) {

        this.employeeRepository = employeeRepository;

        this.trainingEnrollmentRepository =
                trainingEnrollmentRepository;

        this.knowledgeGapRepository =
                knowledgeGapRepository;
    }

    // =========================================================
    // GET DEPARTMENT DASHBOARD
    // =========================================================

    @Transactional(readOnly = true)
    public DepartmentDashboardDTO getDepartmentDashboard(
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

        // -----------------------------------------------------
        // GET TRAINING ENROLLMENTS
        // -----------------------------------------------------

        List<TrainingEnrollment> enrollments =
                trainingEnrollmentRepository
                        .findByEmployeeDepartmentId(
                                departmentId
                        );

        // -----------------------------------------------------
        // GET KNOWLEDGE GAPS
        // -----------------------------------------------------

        List<KnowledgeGap> knowledgeGaps =
                knowledgeGapRepository
                        .findByEmployeeDepartmentId(
                                departmentId
                        );

        // -----------------------------------------------------
        // CREATE DTO
        // -----------------------------------------------------

        DepartmentDashboardDTO dashboard =
                new DepartmentDashboardDTO();

        dashboard.setDepartmentId(
                department.getId()
        );

        dashboard.setDepartmentName(
                department.getDepartmentName()
        );

        dashboard.setDepartmentDescription(
                department.getDescription()
        );

        // =====================================================
        // TOTAL EMPLOYEES
        // =====================================================

        dashboard.setTotalEmployees(
                employees.size()
        );

        // =====================================================
        // TRAINING ENROLLED
        // =====================================================

        dashboard.setTrainingEnrolled(
                enrollments.size()
        );

        // =====================================================
        // TRAINING COMPLETED
        // =====================================================

        long completedCount =
                enrollments.stream()
                        .filter(enrollment ->
                                enrollment.getStatus() ==
                                        TrainingStatus.COMPLETED
                                ||
                                enrollment.getStatus() ==
                                        TrainingStatus.CERTIFIED
                        )
                        .count();

        dashboard.setTrainingCompleted(
                completedCount
        );

        // =====================================================
        // AVERAGE LEARNING PROGRESS
        // =====================================================

        double averageProgress = 0.0;

        if (!enrollments.isEmpty()) {

            averageProgress =
                    enrollments.stream()
                            .map(
                                    TrainingEnrollment
                                            ::getProgressPercentage
                            )
                            .filter(progress ->
                                    progress != null
                            )
                            .mapToInt(Integer::intValue)
                            .average()
                            .orElse(0.0);
        }

        // Round to 2 decimal places
        averageProgress =
                Math.round(
                        averageProgress * 100.0
                ) / 100.0;

        dashboard.setAverageLearningProgress(
                averageProgress
        );

        // =====================================================
        // CRITICAL SKILL GAPS
        // =====================================================

        /*
         * Gap scale:
         *
         * 0 = No gap
         * 1 = Low
         * 2 = Moderate
         * 3 = High
         * 4+ = Critical
         *
         * Therefore we consider gap >= 3
         * as a critical/high-risk gap.
         */

        long criticalGaps =
                knowledgeGaps.stream()
                        .filter(gap ->
                                gap.getGap() != null
                                        &&
                                gap.getGap() >= 3
                        )
                        .count();

        dashboard.setCriticalSkillGaps(
                criticalGaps
        );

        // =====================================================
        // TOP GAP
        // =====================================================

        if (!knowledgeGaps.isEmpty()) {

            Map<String, Long> gapCounts =
                    knowledgeGaps.stream()
                            .filter(gap ->
                                    gap.getSkill() != null
                                            &&
                                    gap.getSkill()
                                            .getSkillName() != null
                            )
                            .collect(
                                    Collectors.groupingBy(
                                            gap ->
                                                    gap.getSkill()
                                                            .getSkillName(),
                                            Collectors.counting()
                                    )
                            );

            if (!gapCounts.isEmpty()) {

                Map.Entry<String, Long> topGapEntry =
                        Collections.max(
                                gapCounts.entrySet(),
                                Map.Entry.comparingByValue()
                        );

                dashboard.setTopGap(
                        topGapEntry.getKey()
                );

                dashboard.setTopGapCount(
                        topGapEntry.getValue()
                );
            }
        }

        // -----------------------------------------------------
        // DEFAULT TOP GAP
        // -----------------------------------------------------

        if (dashboard.getTopGap() == null) {

            dashboard.setTopGap(
                    "No significant skill gaps"
            );

            dashboard.setTopGapCount(0);
        }

        return dashboard;
    }
}