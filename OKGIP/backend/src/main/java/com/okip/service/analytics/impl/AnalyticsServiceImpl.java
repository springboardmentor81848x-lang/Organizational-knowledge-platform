package com.okip.service.analytics.impl;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.okip.dto.analytics.DepartmentAnalyticsDTO;
import com.okip.dto.analytics.EmployeeAnalyticsDTO;
import com.okip.dto.analytics.ProficiencyAnalyticsDTO;
import com.okip.dto.analytics.SkillGapAnalyticsDTO;
import com.okip.dto.analytics.SkillGapHeatmapDTO;
import com.okip.dto.analytics.TeamAnalyticsDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.service.analytics.AnalyticsService;

import com.okip.entity.assessment.Assessment;
import com.okip.entity.assessment.AssessmentAttempt;
import com.okip.repository.assessment.AssessmentAttemptRepository;
@Service
public class AnalyticsServiceImpl
        implements AnalyticsService {

    private final EmployeeRepository employeeRepository;

    private final EmployeeJobRoleRepository employeeJobRoleRepository;

    private final EmployeeSkillRepository employeeSkillRepository;

    private final KnowledgeGapRepository knowledgeGapRepository;

    private final AssessmentAttemptRepository assessmentAttemptRepository;

    public AnalyticsServiceImpl(
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            EmployeeSkillRepository employeeSkillRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            KnowledgeGapRepository knowledgeGapRepository) {

        this.employeeRepository = employeeRepository;

        this.employeeJobRoleRepository =
                employeeJobRoleRepository;

        this.employeeSkillRepository =
                employeeSkillRepository;

        this.knowledgeGapRepository =
                knowledgeGapRepository;

        this.assessmentAttemptRepository =
        assessmentAttemptRepository;
    }

    // =====================================================
    // EMPLOYEE ANALYTICS
    // =====================================================

    @Override
    public EmployeeAnalyticsDTO getEmployeeAnalytics(
            Long employeeId) {

        Employee employee =
                getEmployee(employeeId);

        List<KnowledgeGap> gaps =
                getEmployeeGaps(employee);

        EmployeeAnalyticsDTO response =
                new EmployeeAnalyticsDTO();

        response.setEmployeeId(
                employee.getEmployeeId());

        response.setEmployeeCode(
                employee.getEmployeeCode());

        response.setEmployeeName(
                employee.getFirstName()
                        + " "
                        + employee.getLastName());

        // Active Job Role
        List<EmployeeJobRole> roles =
                employeeJobRoleRepository
                        .findByEmployeeAndActiveTrue(
                                employee);

        if (!roles.isEmpty()) {

            response.setJobRoleName(
                    roles.get(0)
                            .getJobRole()
                            .getJobRoleName());
        }

        response.setTotalSkills(
                gaps.size());

        int completedSkills = 0;

        double totalGap = 0.0;

        for (KnowledgeGap gap : gaps) {

            if (gap.getGapType() != null
                    && "COMPLETE".equals(
                            gap.getGapType().name())) {

                completedSkills++;
            }

            if (gap.getGapPercentage() != null) {

                totalGap +=
                        gap.getGapPercentage();
            }
        }

        response.setCompletedSkills(
                completedSkills);

        response.setGapSkills(
                gaps.size() - completedSkills);

        if (!gaps.isEmpty()) {

            double averageGap =
                    totalGap / gaps.size();

            response.setOverallGapPercentage(
                    round(averageGap));

            response.setReadinessPercentage(
                    round(100.0 - averageGap));

        } else {

            response.setOverallGapPercentage(
                    0.0);

            response.setReadinessPercentage(
                    100.0);
        }

        return response;
    }

    // =====================================================
    // EMPLOYEE SKILL GAPS
    // =====================================================

    @Override
    public List<SkillGapAnalyticsDTO>
            getEmployeeSkillGaps(
                    Long employeeId) {

        Employee employee =
                getEmployee(employeeId);

        List<KnowledgeGap> gaps =
                getEmployeeGaps(employee);

        List<SkillGapAnalyticsDTO> response =
                new ArrayList<>();

        for (KnowledgeGap gap : gaps) {

            SkillGapAnalyticsDTO dto =
                    new SkillGapAnalyticsDTO();

            if (gap.getSkill() != null) {

                dto.setSkillName(
                        gap.getSkill()
                                .getSkillName());
            }

            if (gap.getGapType() != null) {

                dto.setGapType(
                        gap.getGapType().name());
            }

            dto.setGapPercentage(
                    round(
                            gap.getGapPercentage()));

            dto.setGapScore(
                    round(
                            gap.getGapScore()));

            response.add(dto);
        }

        return response;
    }

    // =====================================================
    // EMPLOYEE PROFICIENCY
    // =====================================================

     @Override
public List<ProficiencyAnalyticsDTO> getEmployeeProficiency(
        Long employeeId) {

    Employee employee =
            getEmployee(employeeId);

    // ----------------------------------------------------
    // IMPORTANT:
    // Start from skills actually added by the employee
    // in employee_skills.
    // Do NOT start from KnowledgeGap.
    // ----------------------------------------------------

    List<EmployeeSkill> employeeSkills =
            employeeSkillRepository.findByEmployee(employee);

    List<EmployeeJobRole> roles =
            employeeJobRoleRepository
                    .findByEmployeeAndActiveTrue(employee);

    List<ProficiencyAnalyticsDTO> response =
            new ArrayList<>();

    for (EmployeeSkill employeeSkill : employeeSkills) {

        if (employeeSkill.getSkill() == null) {
            continue;
        }

        ProficiencyAnalyticsDTO dto =
                new ProficiencyAnalyticsDTO();

        // ----------------------------------------------------
        // SKILL NAME
        // ----------------------------------------------------

        dto.setSkillName(
                employeeSkill.getSkill()
                        .getSkillName());

        // ----------------------------------------------------
        // CURRENT EMPLOYEE PROFICIENCY
        // Source: employee_skills
        // ----------------------------------------------------

        if (employeeSkill.getProficiencyLevel() != null) {

            dto.setCurrentProficiency(
                    employeeSkill.getProficiencyLevel()
                            .name());
        }

        // ----------------------------------------------------
        // REQUIRED PROFICIENCY
        // Source: employee's active job role
        // ----------------------------------------------------

        if (!roles.isEmpty()) {

            for (EmployeeJobRole role : roles) {

                knowledgeGapRepository
                        .findByEmployeeJobRoleIn(
                                List.of(role))
                        .stream()
                        .filter(gap ->
                                gap.getSkill() != null
                                && gap.getSkill()
                                        .getSkillId()
                                        .equals(
                                                employeeSkill
                                                        .getSkill()
                                                        .getSkillId()))
                        .findFirst()
                        .ifPresent(gap -> {

                            if (gap.getRequiredProficiency() != null) {

                                dto.setRequiredProficiency(
                                        gap.getRequiredProficiency()
                                                .name());
                            }
                        });

                if (dto.getRequiredProficiency() != null) {
                    break;
                }
            }
        }

        // ----------------------------------------------------
        // LATEST SUBMITTED SELF ASSESSMENT
        // ----------------------------------------------------

        assessmentAttemptRepository
                .findTopByEmployeeEmployeeIdAndAssessmentSkillSkillIdAndAssessmentAssessmentTypeAndStatusOrderBySubmittedAtDesc(
                        employee.getEmployeeId(),
                        employeeSkill.getSkill().getSkillId(),
                        Assessment.AssessmentType.SELF,
                        AssessmentAttempt.Status.SUBMITTED
                )
                .ifPresent(attempt -> {

                    dto.setAssessmentScore(
                            attempt.getScore());

                    dto.setAssessmentTotalMarks(
                            attempt.getAssessment()
                                    .getTotalMarks());

                    dto.setProficiencyPercentage(
                            attempt.getPercentage());
                });

        response.add(dto);
    }

    return response;
}

    // =====================================================
    // TEAM ANALYTICS
    // =====================================================

    @Override
    public List<TeamAnalyticsDTO>
            getTeamAnalytics() {

        Employee manager = getLoggedInEmployee();

        List<Employee> employees = employeeJobRoleRepository
                .findByAssignedByAndActiveTrue(manager)
                .stream().map(EmployeeJobRole::getEmployee)
                .filter(java.util.Objects::nonNull).distinct().toList();

        List<TeamAnalyticsDTO> response =
                new ArrayList<>();

        for (Employee employee : employees) {

            List<KnowledgeGap> gaps =
                    getEmployeeGaps(employee);

            double totalGap = 0.0;

            int validGapCount = 0;

            for (KnowledgeGap gap : gaps) {

                if (gap.getGapPercentage()
                        != null) {

                    totalGap +=
                            gap.getGapPercentage();

                    validGapCount++;
                }
            }

            double averageGap =
                    validGapCount == 0 ? 0.0 : totalGap / validGapCount;

            TeamAnalyticsDTO dto =
                    new TeamAnalyticsDTO();

            dto.setEmployeeId(
                    employee.getEmployeeId());

            dto.setEmployeeCode(
                    employee.getEmployeeCode());

            dto.setEmployeeName(
                    employee.getFirstName()
                            + " "
                            + employee.getLastName());

            List<EmployeeJobRole> roles =
                    employeeJobRoleRepository
                            .findByEmployeeAndActiveTrue(
                                    employee);

            if (!roles.isEmpty()) {

                dto.setJobRoleName(
                        roles.get(0)
                                .getJobRole()
                                .getJobRoleName());
            }

            dto.setGapPercentage(
                    round(averageGap));

            dto.setReadinessPercentage(
                    round(100.0 - averageGap));

            response.add(dto);
        }

        return response;
    }

    // =====================================================
    // DEPARTMENT ANALYTICS
    // =====================================================

    @Override
    public List<DepartmentAnalyticsDTO>
            getDepartmentAnalytics() {

        List<Employee> employees =
                employeeRepository.findAll();

        Map<String, List<Employee>>
                employeesByDepartment =
                        new LinkedHashMap<>();

        for (Employee employee : employees) {

            if (employee.getDepartment()
                    == null) {

                continue;
            }

            String departmentName =
                    employee.getDepartment()
                            .getDepartmentName();

            employeesByDepartment
                    .computeIfAbsent(
                            departmentName,
                            key ->
                                    new ArrayList<>())
                    .add(employee);
        }

        List<DepartmentAnalyticsDTO> response =
                new ArrayList<>();

        for (Map.Entry<String, List<Employee>>
                entry :
                employeesByDepartment.entrySet()) {

            String departmentName =
                    entry.getKey();

            List<Employee>
                    departmentEmployees =
                            entry.getValue();

            double totalGap = 0.0;

            int employeesWithGaps = 0;

            for (Employee employee :
                    departmentEmployees) {

                List<KnowledgeGap> gaps =
                        getEmployeeGaps(employee);

                if (gaps.isEmpty()) {
                    continue;
                }

                double employeeGap = 0.0;

                int validGapCount = 0;

                for (KnowledgeGap gap :
                        gaps) {

                    if (gap.getGapPercentage()
                            != null) {

                        employeeGap +=
                                gap.getGapPercentage();

                        validGapCount++;
                    }
                }

                if (validGapCount == 0) {
                    continue;
                }

                totalGap +=
                        employeeGap
                                / validGapCount;

                employeesWithGaps++;
            }

            if (employeesWithGaps == 0) {
                continue;
            }

            double averageGap =
                    totalGap
                            / employeesWithGaps;

            DepartmentAnalyticsDTO dto =
                    new DepartmentAnalyticsDTO();

            dto.setDepartmentName(
                    departmentName);

            dto.setEmployeeCount(
                    departmentEmployees.size());

            dto.setAverageGapPercentage(
                    round(averageGap));

            dto.setAverageReadinessPercentage(
                    round(100.0 - averageGap));

            response.add(dto);
        }

        return response;
    }

    // =====================================================
    // TEAM SKILL GAP HEATMAP
    // =====================================================

    @Override
    public List<SkillGapHeatmapDTO>
            getTeamSkillGapHeatmap() {

        Employee manager = getLoggedInEmployee();

        List<Employee> employees = employeeJobRoleRepository
                .findByAssignedByAndActiveTrue(manager)
                .stream().map(EmployeeJobRole::getEmployee)
                .filter(java.util.Objects::nonNull).distinct().toList();

        /*
         * Map:
         *
         * Skill Name
         *      ↓
         * List of employee gap percentages
         *
         * Example:
         *
         * Java
         *  -> 70
         *  -> 40
         *  -> 80
         *
         * Average = 63.33
         */

        Map<String, List<Double>>
                skillGapMap =
                        new LinkedHashMap<>();

        for (Employee employee :
                employees) {

            List<KnowledgeGap> gaps =
                    getEmployeeGaps(employee);

            for (KnowledgeGap gap :
                    gaps) {

                if (gap.getSkill() == null) {
                    continue;
                }

                if (gap.getGapPercentage()
                        == null) {

                    continue;
                }

                String skillName =
                        gap.getSkill()
                                .getSkillName();

                skillGapMap
                        .computeIfAbsent(
                                skillName,
                                key ->
                                        new ArrayList<>())
                        .add(
                                gap.getGapPercentage());
            }
        }

        List<SkillGapHeatmapDTO> response =
                new ArrayList<>();

        for (Map.Entry<String, List<Double>>
                entry :
                skillGapMap.entrySet()) {

            String skillName =
                    entry.getKey();

            List<Double>
                    gapPercentages =
                            entry.getValue();

            if (gapPercentages.isEmpty()) {
                continue;
            }

            double averageGap =
                    gapPercentages
                            .stream()
                            .mapToDouble(
                                    Double::doubleValue)
                            .average()
                            .orElse(0.0);

            SkillGapHeatmapDTO dto =
                    new SkillGapHeatmapDTO();

            dto.setSkillName(
                    skillName);

            dto.setAverageGapPercentage(
                    round(averageGap));

            dto.setEmployeeCount(
                    gapPercentages.size());

            response.add(dto);
        }

        /*
         * Highest gap first.
         *
         * This makes the most critical
         * skills appear first on the
         * manager dashboard heatmap.
         */

        response.sort(
                (a, b) ->
                        Double.compare(
                                b.getAverageGapPercentage(),
                                a.getAverageGapPercentage()));

        return response;
    }

    private Employee getLoggedInEmployee() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Authenticated manager not found.");
        }
        return employeeRepository.findByOfficialEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated manager not found."));
    }

    // =====================================================
    // GET EMPLOYEE
    // =====================================================

    private Employee getEmployee(
            Long employeeId) {

        return employeeRepository
                .findById(employeeId)
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        "Employee not found."));
    }

    // =====================================================
    // GET EMPLOYEE KNOWLEDGE GAPS
    // =====================================================

    private List<KnowledgeGap>
            getEmployeeGaps(
                    Employee employee) {

        List<EmployeeJobRole> roles =
                employeeJobRoleRepository
                        .findByEmployeeAndActiveTrue(
                                employee);

        if (roles.isEmpty()) {

            return new ArrayList<>();
        }

        return knowledgeGapRepository
                .findByEmployeeJobRoleIn(
                        roles);
    }

    // =====================================================
    // GET EMPLOYEE ID BY EMAIL
    // =====================================================

    @Override
    public Long getEmployeeIdByEmail(
            String email) {

        Employee employee =
                employeeRepository
                        .findByOfficialEmail(email)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Employee not found."));

        return employee.getEmployeeId();
    }

    // =====================================================
    // ROUND VALUE
    // =====================================================

    private double round(
            Double value) {

        if (value == null) {
            return 0.0;
        }

        return Math.round(
                value * 100.0)
                / 100.0;
    }
}