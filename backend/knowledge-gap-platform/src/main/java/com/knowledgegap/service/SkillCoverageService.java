package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.SkillCoverageDTO;
import com.knowledgegap.dto.SkillCoverageDTO.SkillCoverageItemDTO;
import com.knowledgegap.entity.Department;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;

@Service
public class SkillCoverageService {

    private final EmployeeRepository employeeRepository;

    private final EmployeeSkillRepository employeeSkillRepository;

    private final KnowledgeGapRepository knowledgeGapRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SkillCoverageService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            KnowledgeGapRepository knowledgeGapRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
    }

    // =========================================================
    // GET SKILL COVERAGE
    // =========================================================

    @Transactional(readOnly = true)
    public SkillCoverageDTO getSkillCoverage(
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
        // GET EMPLOYEE SKILLS
        // -----------------------------------------------------

        List<EmployeeSkill> employeeSkills =
                employeeSkillRepository
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
        // REQUIRED LEVEL BY SKILL
        // -----------------------------------------------------
        //
        // KnowledgeGap contains requiredLevel.
        //
        // For each skill we find the highest required level
        // recorded in the department.
        //
        // If there is no knowledge-gap record, default to 5.
        // -----------------------------------------------------

        Map<Long, Integer> requiredLevelBySkill =
                new HashMap<>();

        for (KnowledgeGap gap : knowledgeGaps) {

            if (gap.getSkill() == null ||
                    gap.getRequiredLevel() == null) {
                continue;
            }

            Long skillId =
                    gap.getSkill().getId();

            int requiredLevel =
                    gap.getRequiredLevel();

            requiredLevelBySkill.merge(
                    skillId,
                    requiredLevel,
                    Math::max
            );
        }

        // -----------------------------------------------------
        // GROUP EMPLOYEE SKILLS BY SKILL
        // -----------------------------------------------------

        Map<Long, List<EmployeeSkill>> groupedSkills =
                employeeSkills.stream()
                        .filter(es ->
                                es.getSkill() != null
                                        &&
                                es.getCurrentLevel() != null
                        )
                        .collect(
                                Collectors.groupingBy(
                                        es ->
                                                es.getSkill()
                                                        .getId()
                                )
                        );

        // -----------------------------------------------------
        // CREATE RESULT
        // -----------------------------------------------------

        List<SkillCoverageItemDTO> items =
                new ArrayList<>();

        for (Map.Entry<Long, List<EmployeeSkill>> entry
                : groupedSkills.entrySet()) {

            List<EmployeeSkill> skillEmployees =
                    entry.getValue();

            if (skillEmployees.isEmpty()) {
                continue;
            }

            Skill skill =
                    skillEmployees.get(0).getSkill();

            Long skillId =
                    skill.getId();

            // -------------------------------------------------
            // EMPLOYEE COUNT
            // -------------------------------------------------

            long employeeCount =
                    skillEmployees.size();

            // -------------------------------------------------
            // AVERAGE CURRENT LEVEL
            // -------------------------------------------------

            double averageLevel =
                    skillEmployees.stream()
                            .map(EmployeeSkill::getCurrentLevel)
                            .filter(level -> level != null)
                            .mapToInt(Integer::intValue)
                            .average()
                            .orElse(0.0);

            averageLevel =
                    Math.round(
                            averageLevel * 100.0
                    ) / 100.0;

            // -------------------------------------------------
            // REQUIRED LEVEL
            // -------------------------------------------------

            int requiredLevel =
                    requiredLevelBySkill.getOrDefault(
                            skillId,
                            5
                    );

            // -------------------------------------------------
            // COVERAGE %
            // -------------------------------------------------

            double coveragePercentage;

            if (requiredLevel <= 0) {

                coveragePercentage = 0;

            } else {

                coveragePercentage =
                        (averageLevel /
                                requiredLevel) * 100.0;
            }

            // Never exceed 100%
            coveragePercentage =
                    Math.min(
                            coveragePercentage,
                            100.0
                    );

            coveragePercentage =
                    Math.round(
                            coveragePercentage * 100.0
                    ) / 100.0;

            // -------------------------------------------------
            // STATUS
            // -------------------------------------------------

            String status;

            if (coveragePercentage >= 80) {

                status = "WELL_COVERED";

            } else if (coveragePercentage >= 50) {

                status = "PARTIALLY_COVERED";

            } else {

                status = "CRITICAL";
            }

            // -------------------------------------------------
            // CREATE DTO
            // -------------------------------------------------

            SkillCoverageItemDTO item =
                    new SkillCoverageItemDTO();

            item.setSkillId(skillId);

            item.setSkillName(
                    skill.getSkillName()
            );

            item.setCategory(
                    skill.getCategory()
            );

            item.setEmployeeCount(
                    employeeCount
            );

            item.setAverageLevel(
                    averageLevel
            );

            item.setRequiredLevel(
                    requiredLevel
            );

            item.setCoveragePercentage(
                    coveragePercentage
            );

            item.setStatus(status);

            items.add(item);
        }

        // -----------------------------------------------------
        // SORT
        // -----------------------------------------------------
        // Lowest coverage first.
        // This puts skills needing attention at the top.
        // -----------------------------------------------------

        items.sort(
                Comparator.comparingDouble(
                        SkillCoverageItemDTO
                                ::getCoveragePercentage
                )
        );

        // -----------------------------------------------------
        // CREATE DASHBOARD DTO
        // -----------------------------------------------------

        SkillCoverageDTO dashboard =
                new SkillCoverageDTO();

        dashboard.setSkills(items);

        dashboard.setTotalSkills(
                items.size()
        );

        // -----------------------------------------------------
        // SUMMARY COUNTS
        // -----------------------------------------------------

        long wellCovered =
                items.stream()
                        .filter(item ->
                                "WELL_COVERED"
                                        .equals(
                                                item.getStatus()
                                        )
                        )
                        .count();

        long partiallyCovered =
                items.stream()
                        .filter(item ->
                                "PARTIALLY_COVERED"
                                        .equals(
                                                item.getStatus()
                                        )
                        )
                        .count();

        long critical =
                items.stream()
                        .filter(item ->
                                "CRITICAL"
                                        .equals(
                                                item.getStatus()
                                        )
                        )
                        .count();

        dashboard.setWellCoveredSkills(
                wellCovered
        );

        dashboard.setPartiallyCoveredSkills(
                partiallyCovered
        );

        dashboard.setCriticalCoverageSkills(
                critical
        );

        return dashboard;
    }
}