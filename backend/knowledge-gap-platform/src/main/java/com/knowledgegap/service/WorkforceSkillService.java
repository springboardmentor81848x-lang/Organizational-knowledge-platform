package com.knowledgegap.service;

<<<<<<< HEAD
import java.util.ArrayList;
import java.util.Arrays;
=======
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
>>>>>>> origin/team1-krishnapriya
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
<<<<<<< HEAD
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
=======
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.SkillRepository;
>>>>>>> origin/team1-krishnapriya

@Service
public class WorkforceSkillService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
<<<<<<< HEAD

    public WorkforceSkillService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
=======
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
>>>>>>> origin/team1-krishnapriya
    }

    public Map<String, Object> getWorkforceSkillInventory() {

<<<<<<< HEAD
        /*
         * Only EMPLOYEE and MANAGER are included
         * in workforce skill inventory.
         */
        List<Employee> employees =
                employeeRepository.findByRoleRoleNameIn(
                        Arrays.asList("EMPLOYEE", "MANAGER")
                );

        int totalEmployees = employees.size();

        /*
         * skillName -> skill levels
         */
        Map<String, List<Integer>> skillLevels =
                new LinkedHashMap<>();

        /*
         * skillName -> number of employees
         */
        Map<String, Integer> skillEmployeeCount =
                new LinkedHashMap<>();

        /*
         * skillName -> category
         */
        Map<String, String> skillCategories =
                new LinkedHashMap<>();

        /*
         * Collect employee skills
         */
        for (Employee employee : employees) {

            List<EmployeeSkill> employeeSkills =
                    employeeSkillRepository.findByEmployee(employee);

            for (EmployeeSkill employeeSkill : employeeSkills) {

                if (employeeSkill.getSkill() == null) {
                    continue;
                }

                String skillName =
                        employeeSkill.getSkill().getSkillName();

                if (skillName == null ||
                        skillName.trim().isEmpty()) {
                    continue;
                }

                int level =
                        employeeSkill.getCurrentLevel() != null
                                ? employeeSkill.getCurrentLevel()
                                : 0;

                /*
                 * Store skill level
                 */
                skillLevels
                        .computeIfAbsent(
                                skillName,
                                k -> new ArrayList<>()
                        )
                        .add(level);

                /*
                 * Count employees
                 */
                skillEmployeeCount.put(
                        skillName,
                        skillEmployeeCount.getOrDefault(
                                skillName,
                                0
                        ) + 1
                );

                /*
                 * Store category
                 */
                skillCategories.put(
                        skillName,
                        employeeSkill.getSkill().getCategory()
                );
            }
        }

        /*
         * Build skill list
         */
        List<Map<String, Object>> skills =
                new ArrayList<>();

        double totalSkillLevel = 0;
        int totalSkillRecords = 0;

        for (String skillName : skillLevels.keySet()) {

            List<Integer> levels =
                    skillLevels.get(skillName);

            int sum =
                    levels.stream()
                            .mapToInt(Integer::intValue)
                            .sum();

            double averageLevel =
                    levels.isEmpty()
                            ? 0
                            : (double) sum / levels.size();

            averageLevel =
                    Math.round(averageLevel * 100.0) / 100.0;

            /*
             * Coverage percentage
             */
            double coverage =
                    totalEmployees > 0
                            ? ((double) levels.size()
                            / totalEmployees) * 100
                            : 0;

            coverage =
                    Math.round(coverage * 100.0) / 100.0;

            /*
             * Gap status
             */
            String gapStatus;

            if (averageLevel >= 4) {

                gapStatus = "Low";

            } else if (averageLevel >= 3) {

                gapStatus = "Medium";

            } else if (averageLevel >= 2) {

                gapStatus = "High";

            } else {

                gapStatus = "Critical";
            }

            /*
             * Skill response
             */
            Map<String, Object> skillData =
                    new LinkedHashMap<>();

            skillData.put(
                    "skill",
                    skillName
            );

            skillData.put(
                    "category",
                    skillCategories.get(skillName)
            );

            skillData.put(
                    "employees",
                    skillEmployeeCount.get(skillName)
            );

            skillData.put(
                    "averageLevel",
                    averageLevel
            );

            skillData.put(
                    "coverage",
                    coverage
            );

            skillData.put(
                    "gapStatus",
                    gapStatus
            );

            skills.add(skillData);

            totalSkillLevel += sum;
            totalSkillRecords += levels.size();
        }

        /*
         * Highest employee coverage first
         */
        skills.sort(
                (a, b) ->
                        Integer.compare(
                                (Integer) b.get("employees"),
                                (Integer) a.get("employees")
                        )
        );

        /*
         * Average workforce skill
         */
        double averageWorkforceSkill =
                totalSkillRecords > 0
                        ? totalSkillLevel / totalSkillRecords
                        : 0;

        averageWorkforceSkill =
                Math.round(
                        averageWorkforceSkill * 100.0
                ) / 100.0;

        /*
         * Count skills with gaps
         */
        int skillsWithGaps = 0;

        for (Map<String, Object> skill : skills) {

            String status =
                    (String) skill.get("gapStatus");

            if (!"Low".equals(status)) {
                skillsWithGaps++;
            }
        }

        /*
         * Final response
         */
        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "totalEmployees",
                totalEmployees
        );

        response.put(
                "totalSkills",
                skills.size()
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
                skills
        );

        return response;
=======
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
>>>>>>> origin/team1-krishnapriya
    }
}