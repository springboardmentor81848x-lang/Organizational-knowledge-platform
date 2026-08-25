package com.knowledgegap.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
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

        Map<String, Object> response =
                new LinkedHashMap<>();

        /*
         * =====================================================
         * EMPLOYEES
         * =====================================================
         *
         * IMPORTANT:
         * Use exactly the same employee filter
         * as HRDashboardService.
         *
         * Only EMPLOYEE and MANAGER are counted.
         *
         */
        List<Employee> employees =
                employeeRepository.findByRoleRoleNameIn(
                        Arrays.asList("EMPLOYEE", "MANAGER")
                );

        int totalEmployees =
                employees.size();


        /*
         * =====================================================
         * SKILLS
         * =====================================================
         */

        List<Skill> skills =
                skillRepository.findAll();

        int totalSkills =
                skills.size();


        /*
         * =====================================================
         * EMPLOYEE SKILLS
         * =====================================================
         */

        List<EmployeeSkill> employeeSkills =
                employeeSkillRepository.findAll();


        /*
         * =====================================================
         * KNOWLEDGE GAPS
         * =====================================================
         */

        List<KnowledgeGap> knowledgeGaps =
                knowledgeGapRepository.findAll();


        /*
         * =====================================================
         * VARIABLES
         * =====================================================
         */

        int skillsWithGaps = 0;

        double totalSkillLevels = 0;

        int skillLevelCount = 0;

        List<Map<String, Object>> skillList =
                new ArrayList<>();


        /*
         * =====================================================
         * PROCESS EACH SKILL
         * =====================================================
         */

        for (Skill skill : skills) {

            Map<String, Object> skillData =
                    new LinkedHashMap<>();


            /*
             * Skill name
             */

            skillData.put(
                    "skill",
                    skill.getSkillName()
            );


            /*
             * Skill category
             */

            skillData.put(
                    "category",
                    skill.getCategory()
            );


            /*
             * =================================================
             * EMPLOYEES HAVING THIS SKILL
             * =================================================
             *
             * IMPORTANT:
             * Only count EmployeeSkill records belonging
             * to employees included in our filtered list.
             *
             */

            int employeeCount = 0;

            List<EmployeeSkill> skillEmployees =
                    employeeSkillRepository.findBySkill(skill);

            for (EmployeeSkill employeeSkill : skillEmployees) {

                Employee employee =
                        employeeSkill.getEmployee();

                if (employee != null &&
                        employees.contains(employee)) {

                    employeeCount++;
                }
            }


            /*
             * =================================================
             * AVERAGE SKILL LEVEL
             * =================================================
             */

            double levelTotal = 0;

            int levelCount = 0;

            for (EmployeeSkill employeeSkill :
                    skillEmployees) {

                Employee employee =
                        employeeSkill.getEmployee();

                /*
                 * Only include employees counted
                 * in the workforce.
                 */

                if (employee == null ||
                        !employees.contains(employee)) {

                    continue;
                }

                if (employeeSkill.getCurrentLevel() != null) {

                    levelTotal +=
                            employeeSkill.getCurrentLevel();

                    levelCount++;

                    totalSkillLevels +=
                            employeeSkill.getCurrentLevel();

                    skillLevelCount++;
                }
            }


            double averageLevel = 0;

            if (levelCount > 0) {

                averageLevel =
                        levelTotal /
                        levelCount;
            }

            averageLevel =
                    round(averageLevel, 2);


            /*
             * =================================================
             * COVERAGE
             * =================================================
             */

            double coverage = 0;

            if (totalEmployees > 0) {

                coverage =
                        ((double) employeeCount /
                                totalEmployees) * 100;
            }

            coverage =
                    round(coverage, 2);


            /*
             * =================================================
             * KNOWLEDGE GAPS
             * =================================================
             */

            int gapCount = 0;

            for (KnowledgeGap gap :
                    knowledgeGaps) {

                if (gap.getSkill() == null) {
                    continue;
                }

                if (gap.getSkill().getId() == null) {
                    continue;
                }

                if (!gap.getSkill().getId()
                        .equals(skill.getId())) {

                    continue;
                }


                /*
                 * Only count gaps belonging to
                 * employees in our workforce.
                 */

                Employee gapEmployee =
                        gap.getEmployee();

                if (gapEmployee == null ||
                        !employees.contains(gapEmployee)) {

                    continue;
                }


                if (gap.getGap() != null &&
                        gap.getGap() > 0) {

                    gapCount++;
                }
            }


            /*
             * =================================================
             * SKILLS WITH GAPS
             * =================================================
             */

            if (gapCount > 0) {

                skillsWithGaps++;
            }


            /*
             * =================================================
             * GAP STATUS
             * =================================================
             */

            String gapStatus =
                    calculateGapStatus(
                            gapCount,
                            employeeCount
                    );


            /*
             * =================================================
             * ADD SKILL DATA
             * =================================================
             */

            skillData.put(
                    "employees",
                    employeeCount
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


            skillList.add(skillData);
        }


        /*
         * =====================================================
         * AVERAGE WORKFORCE SKILL
         * =====================================================
         */

        double averageWorkforceSkill = 0;

        if (skillLevelCount > 0) {

            averageWorkforceSkill =
                    totalSkillLevels /
                    skillLevelCount;
        }

        averageWorkforceSkill =
                round(
                        averageWorkforceSkill,
                        2
                );


        /*
         * =====================================================
         * FINAL RESPONSE
         * =====================================================
         */

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
    }


    /*
     * =========================================================
     * GAP STATUS
     * =========================================================
     */

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


    /*
     * =========================================================
     * ROUND
     * =========================================================
     */

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