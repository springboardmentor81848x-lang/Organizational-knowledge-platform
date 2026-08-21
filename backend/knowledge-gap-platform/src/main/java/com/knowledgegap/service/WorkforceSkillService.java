package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;

@Service
public class WorkforceSkillService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public WorkforceSkillService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
    }

    public Map<String, Object> getWorkforceSkillInventory() {

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
    }
}