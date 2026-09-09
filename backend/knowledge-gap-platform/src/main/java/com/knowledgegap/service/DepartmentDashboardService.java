package com.knowledgegap.service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.DepartmentDashboardDTO;
import com.knowledgegap.dto.DepartmentDashboardDTO.EmployeeSkillGapDTO;
import com.knowledgegap.dto.DepartmentDashboardDTO.TeamSkillGapDTO;
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
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public DepartmentDashboardService(
            EmployeeRepository employeeRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository,
            KnowledgeGapRepository knowledgeGapRepository) {

        this.employeeRepository = employeeRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
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

        Long departmentId = department.getId();

        // -----------------------------------------------------
        // GET ALL EMPLOYEES IN DEPARTMENT
        //
        // IMPORTANT:
        // Department Head dashboard is department-level.
        // Therefore, DO NOT remove the Department Head.
        // -----------------------------------------------------

        List<Employee> employees =
                employeeRepository
                        .findByDepartmentId(departmentId);

        // -----------------------------------------------------
        // GET TRAINING ENROLLMENTS
        // -----------------------------------------------------

        List<TrainingEnrollment> enrollments =
                trainingEnrollmentRepository
                        .findByEmployeeDepartmentId(departmentId);

        // -----------------------------------------------------
        // GET KNOWLEDGE GAPS
        // -----------------------------------------------------

        List<KnowledgeGap> knowledgeGaps =
                knowledgeGapRepository
                        .findByEmployeeDepartmentId(departmentId);

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
        //
        // Entire department.
        // Department Head is included.
        // =====================================================

        dashboard.setTotalEmployees(
                employees.size()
        );

        // =====================================================
        // TRAINING ENROLLED
        // =====================================================
        //
        // Count unique employees who have at least one
        // training enrollment.
        // =====================================================

        long trainingEnrolled =
                enrollments.stream()
                        .filter(enrollment ->
                                enrollment.getEmployee() != null
                        )
                        .map(enrollment ->
                                enrollment.getEmployee().getId()
                        )
                        .filter(id -> id != null)
                        .distinct()
                        .count();

        dashboard.setTrainingEnrolled(
                trainingEnrolled
        );

        // =====================================================
        // TRAINING COMPLETED
        // =====================================================
        //
        // Count unique employees who have completed/certified
        // at least one training.
        // =====================================================

        long trainingCompleted =
                enrollments.stream()
                        .filter(enrollment ->
                                enrollment.getEmployee() != null
                        )
                        .filter(enrollment ->
                                enrollment.getStatus() ==
                                        TrainingStatus.COMPLETED
                                        ||
                                enrollment.getStatus() ==
                                        TrainingStatus.CERTIFIED
                        )
                        .map(enrollment ->
                                enrollment.getEmployee().getId()
                        )
                        .filter(id -> id != null)
                        .distinct()
                        .count();

        dashboard.setTrainingCompleted(
                trainingCompleted
        );

        // =====================================================
        // AVERAGE LEARNING PROGRESS
        // =====================================================
        //
        // Average progress across all department training
        // enrollments that have a progress value.
        // =====================================================

        double averageProgress =
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
        //
        // Department-wide critical gaps.
        // Gap >= 3 is considered critical according to
        // the existing dashboard logic.
        // =====================================================

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

        // =====================================================
        // DEFAULT TOP GAP
        // =====================================================

        if (dashboard.getTopGap() == null) {

            dashboard.setTopGap(
                    "No significant skill gaps"
            );

            dashboard.setTopGapCount(0);
        }

        // =====================================================
        // DEPARTMENT SKILL GAP HEATMAP
        // =====================================================
        //
        // Department Head sees the complete department.
        // =====================================================

        List<TeamSkillGapDTO> departmentSkillGapMap =
                buildTeamSkillGapMap(
                        employees,
                        knowledgeGaps
                );

        dashboard.setTeamSkillGapMap(
                departmentSkillGapMap
        );

        // =====================================================
        // RETURN DASHBOARD
        // =====================================================

        return dashboard;
    }

    // =========================================================
    // BUILD DEPARTMENT SKILL GAP MAP
    // =========================================================

    private List<TeamSkillGapDTO> buildTeamSkillGapMap(
            List<Employee> employees,
            List<KnowledgeGap> knowledgeGaps) {

        // -----------------------------------------------------
        // Create lookup:
        //
        // skill -> employee -> gap
        // -----------------------------------------------------

        Map<String, Map<String, Integer>> gapMap =
                new LinkedHashMap<>();

        for (KnowledgeGap knowledgeGap : knowledgeGaps) {

            if (knowledgeGap.getSkill() == null
                    || knowledgeGap.getSkill().getSkillName() == null
                    || knowledgeGap.getEmployee() == null
                    || knowledgeGap.getEmployee().getEmployeeId() == null) {

                continue;
            }

            String skillName =
                    knowledgeGap.getSkill().getSkillName();

            String employeeId =
                    knowledgeGap.getEmployee().getEmployeeId();

            Integer gap =
                    knowledgeGap.getGap();

            if (gap == null) {
                gap = 0;
            }

            gapMap
                    .computeIfAbsent(
                            skillName,
                            key -> new LinkedHashMap<>()
                    )
                    .put(
                            employeeId,
                            gap
                    );
        }

        // -----------------------------------------------------
        // Convert to DTO
        // -----------------------------------------------------

        return gapMap.entrySet()
                .stream()
                .sorted(
                        Map.Entry.comparingByKey()
                )
                .map(skillEntry -> {

                    String skillName =
                            skillEntry.getKey();

                    Map<String, Integer> employeeGaps =
                            skillEntry.getValue();

                    List<EmployeeSkillGapDTO> employeeData =
                            employees.stream()
                                    .filter(employee ->
                                            employee != null
                                                    &&
                                            employee.getEmployeeId() != null
                                    )
                                    .map(employee -> {

                                        String employeeId =
                                                employee.getEmployeeId();

                                        String employeeName =
                                                buildEmployeeName(
                                                        employee
                                                );

                                        Integer gap =
                                                employeeGaps
                                                        .getOrDefault(
                                                                employeeId,
                                                                0
                                                        );

                                        return new EmployeeSkillGapDTO(
                                                employeeId,
                                                employeeName,
                                                gap
                                        );
                                    })
                                    .collect(
                                            Collectors.toList()
                                    );

                    return new TeamSkillGapDTO(
                            skillName,
                            employeeData
                    );
                })
                .collect(
                        Collectors.toList()
                );
    }

    // =========================================================
    // BUILD EMPLOYEE NAME
    // =========================================================

    private String buildEmployeeName(
            Employee employee) {

        String firstName =
                employee.getFirstName() == null
                        ? ""
                        : employee.getFirstName();

        String lastName =
                employee.getLastName() == null
                        ? ""
                        : employee.getLastName();

        String fullName =
                (firstName + " " + lastName).trim();

        if (fullName.isEmpty()) {
            return employee.getEmployeeId();
        }

        return fullName;
    }
}