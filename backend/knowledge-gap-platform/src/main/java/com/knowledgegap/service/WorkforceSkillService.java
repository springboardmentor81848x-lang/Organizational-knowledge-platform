package com.knowledgegap.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
public class WorkforceSkillService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;

    public WorkforceSkillService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            SkillRepository skillRepository,
            KnowledgeGapRepository knowledgeGapRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
    }

    public Map<String, Object> getWorkforceSkillInventory() {

        Map<String, Object> response = new LinkedHashMap<>();

        try {

            // =====================================================
            // GET ALL EMPLOYEES
            // =====================================================

            List<Employee> employees = employeeRepository.findAll();

            /*
             * We consider employees having the EMPLOYEE application role
             * as workforce employees.
             *
             * If your EmployeeRepository already returns only employees,
             * findAll() is sufficient.
             */

            int totalEmployees = employees.size();

            // =====================================================
            // GET ALL SKILLS
            // =====================================================

            List<Skill> skills = skillRepository.findAll();

            int totalSkills = skills.size();

            // =====================================================
            // GET ALL EMPLOYEE SKILLS
            // =====================================================

            List<EmployeeSkill> employeeSkills =
                    employeeSkillRepository.findAll();

            // =====================================================
            // GET ALL KNOWLEDGE GAPS
            // =====================================================

            List<KnowledgeGap> knowledgeGaps =
                    knowledgeGapRepository.findAll();

            // =====================================================
            // SUMMARY VARIABLES
            // =====================================================

            int skillsWithGaps = 0;

            double totalSkillLevels = 0;
            int skillLevelCount = 0;

            List<Map<String, Object>> skillList = new ArrayList<>();

            // =====================================================
            // PROCESS EACH SKILL
            // =====================================================

            for (Skill skill : skills) {

                Map<String, Object> skillData =
                        new LinkedHashMap<>();

                skillData.put("skill", skill.getSkillName());
                skillData.put("category", skill.getCategory());

                // -------------------------------------------------
                // Employee skills for this particular skill
                // -------------------------------------------------

                List<EmployeeSkill> skillEmployees =
                        employeeSkillRepository.findBySkill(skill);

                int employeeCount = skillEmployees.size();

                // -------------------------------------------------
                // Average skill level
                // -------------------------------------------------

                double levelTotal = 0;
                int levelCount = 0;

                for (EmployeeSkill employeeSkill : skillEmployees) {

                    if (employeeSkill.getCurrentLevel() != null) {

                        levelTotal += employeeSkill.getCurrentLevel();
                        levelCount++;

                        totalSkillLevels +=
                                employeeSkill.getCurrentLevel();

                        skillLevelCount++;
                    }
                }

                double averageLevel = 0;

                if (levelCount > 0) {
                    averageLevel =
                            levelTotal / levelCount;
                }

                averageLevel =
                        round(averageLevel, 2);

                // -------------------------------------------------
                // Coverage
                // -------------------------------------------------

                double coverage = 0;

                if (totalEmployees > 0) {

                    coverage =
                            ((double) employeeCount /
                                    totalEmployees) * 100;
                }

                coverage = round(coverage, 2);

                // -------------------------------------------------
                // Find knowledge gaps for this skill
                // -------------------------------------------------

                List<KnowledgeGap> skillGaps =
                        knowledgeGaps.stream()
                                .filter(gap ->
                                        gap.getSkill() != null
                                        && gap.getSkill().getId()
                                            .equals(skill.getId())
                                )
                                .toList();

                // -------------------------------------------------
                // Determine gap status
                // -------------------------------------------------

                int gapCount = 0;

                for (KnowledgeGap gap : skillGaps) {

                    if (gap.getGap() != null
                            && gap.getGap() > 0) {

                        gapCount++;
                    }
                }

                if (gapCount > 0) {
                    skillsWithGaps++;
                }

                String gapStatus =
                        calculateGapStatus(
                                gapCount,
                                employeeCount
                        );

                // -------------------------------------------------
                // Add skill information
                // -------------------------------------------------

                skillData.put("employees", employeeCount);
                skillData.put("averageLevel", averageLevel);
                skillData.put("coverage", coverage);
                skillData.put("gapStatus", gapStatus);

                skillList.add(skillData);
            }

            // =====================================================
            // AVERAGE WORKFORCE SKILL
            // =====================================================

            double averageWorkforceSkill = 0;

            if (skillLevelCount > 0) {

                averageWorkforceSkill =
                        totalSkillLevels /
                                skillLevelCount;
            }

            averageWorkforceSkill =
                    round(averageWorkforceSkill, 2);

            // =====================================================
            // FINAL RESPONSE
            // =====================================================

            response.put(
                    "totalEmployees",
                    totalEmployees
            );

            response.put(
                    "totalSkills",
                    totalSkills
            );

            response.put(
                    "skillsWithGaps",
                    skillsWithGaps
            );

            response.put(
                    "averageWorkforceSkill",
                    averageWorkforceSkill
            );

            response.put(
                    "skills",
                    skillList
            );

            return response;

        } catch (Exception e) {

            System.err.println(
                    "Error generating workforce skill inventory:"
            );

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to generate workforce skill inventory",
                    e
            );
        }
    }

    // =============================================================
    // GAP STATUS
    // =============================================================

    private String calculateGapStatus(
            int gapCount,
            int employeeCount) {

        if (gapCount == 0) {
            return "Low";
        }

        if (employeeCount == 0) {
            return "Low";
        }

        double percentage =
                ((double) gapCount /
                        employeeCount) * 100;

        if (percentage >= 75) {
            return "Critical";
        }

        if (percentage >= 50) {
            return "High";
        }

        if (percentage >= 25) {
            return "Medium";
        }

        return "Low";
    }

    // =============================================================
    // ROUND DECIMAL
    // =============================================================

    private double round(
            double value,
            int places) {

        return BigDecimal
                .valueOf(value)
                .setScale(
                        places,
                        RoundingMode.HALF_UP
                )
                .doubleValue();
    }
}