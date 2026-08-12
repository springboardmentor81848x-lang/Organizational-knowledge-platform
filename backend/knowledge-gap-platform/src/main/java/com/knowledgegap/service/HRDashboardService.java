package com.knowledgegap.service;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class HRDashboardService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;

    public HRDashboardService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            KnowledgeGapRepository knowledgeGapRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
    }

    public Map<String, Object> getDashboardSummary() {

        /*
         * Only EMPLOYEE and MANAGER are counted.
         * HR and ADMIN are excluded.
         */
        List<Employee> employees =
                employeeRepository.findByRoleRoleNameIn(
                Arrays.asList("EMPLOYEE", "MANAGER")
            );

        int totalEmployees = employees.size();

        int employeesWithGaps = 0;
        int totalKnowledgeGaps = 0;

        double totalGapValue = 0;

        int criticalGaps = 0;

        Map<String, Integer> performance =
                new LinkedHashMap<>();

        performance.put("excellent", 0);
        performance.put("good", 0);
        performance.put("needsAttention", 0);
        performance.put("critical", 0);

        Map<String, Integer> gapDistribution =
                new LinkedHashMap<>();

        gapDistribution.put("low", 0);
        gapDistribution.put("medium", 0);
        gapDistribution.put("high", 0);
        gapDistribution.put("critical", 0);

        /*
         * Skill gap aggregation
         */
        Map<String, List<Integer>> skillGapValues =
                new HashMap<>();

        Map<String, Integer> skillEmployeeCount =
                new HashMap<>();

        List<Map<String, Object>> employeeOverview =
                new ArrayList<>();


        for (Employee employee : employees) {

            /*
             * Employee skills
             */
            List<EmployeeSkill> employeeSkills =
                    employeeSkillRepository.findByEmployee(employee);

            double averageSkill = 0;

            if (!employeeSkills.isEmpty()) {

                int totalSkillLevel = 0;

                for (EmployeeSkill employeeSkill : employeeSkills) {

                    if (employeeSkill.getCurrentLevel() != null) {
                        totalSkillLevel +=
                                employeeSkill.getCurrentLevel();
                    }
                }

                double averageLevel =
                        (double) totalSkillLevel /
                        employeeSkills.size();

                /*
                 * Level 5 = 100%
                 */
                averageSkill =
                        (averageLevel / 5.0) * 100;
            }


            /*
             * Knowledge gaps
             */
            List<KnowledgeGap> gaps =
                    knowledgeGapRepository.findByEmployee(employee);

            if (!gaps.isEmpty()) {
                employeesWithGaps++;
            }

            double employeeTotalGap = 0;

            for (KnowledgeGap gap : gaps) {

                int gapValue =
                        gap.getGap() != null
                                ? gap.getGap()
                                : 0;

                totalKnowledgeGaps++;
                totalGapValue += gapValue;
                employeeTotalGap += gapValue;


                /*
                 * Gap distribution
                 */

                if (gapValue == 1) {

                    gapDistribution.put(
                            "low",
                            gapDistribution.get("low") + 1
                    );

                } else if (gapValue == 2) {

                    gapDistribution.put(
                            "medium",
                            gapDistribution.get("medium") + 1
                    );

                } else if (gapValue == 3) {

                    gapDistribution.put(
                            "high",
                            gapDistribution.get("high") + 1
                    );

                } else if (gapValue >= 4) {

                    gapDistribution.put(
                            "critical",
                            gapDistribution.get("critical") + 1
                    );

                    criticalGaps++;
                }


                /*
                 * Top skill gaps
                 */

                if (gap.getSkill() != null) {

                    String skillName =
                            gap.getSkill().getSkillName();

                    skillGapValues
                            .computeIfAbsent(
                                    skillName,
                                    k -> new ArrayList<>()
                            )
                            .add(gapValue);

                    skillEmployeeCount.put(
                            skillName,
                            skillEmployeeCount.getOrDefault(
                                    skillName,
                                    0
                            ) + 1
                    );
                }
            }


            /*
             * Employee performance
             *
             * 80%+  = Excellent
             * 60-79 = Good
             * 40-59 = Needs Attention
             * <40   = Critical
             */

            if (averageSkill >= 80) {

                performance.put(
                        "excellent",
                        performance.get("excellent") + 1
                );

            } else if (averageSkill >= 60) {

                performance.put(
                        "good",
                        performance.get("good") + 1
                );

            } else if (averageSkill >= 40) {

                performance.put(
                        "needsAttention",
                        performance.get("needsAttention") + 1
                );

            } else {

                performance.put(
                        "critical",
                        performance.get("critical") + 1
                );
            }


            /*
             * Employee gap status
             */

            String gapStatus;

            if (employeeTotalGap == 0) {

                gapStatus = "Low";

            } else if (employeeTotalGap <= 2) {

                gapStatus = "Medium";

            } else if (employeeTotalGap <= 4) {

                gapStatus = "High";

            } else {

                gapStatus = "Critical";
            }


            /*
             * Employee overview object
             */

            Map<String, Object> employeeData =
                    new LinkedHashMap<>();

            employeeData.put(
                    "employeeId",
                    employee.getEmployeeId()
            );

            employeeData.put(
                    "employee",
                    employee.getFirstName() +
                    " " +
                    employee.getLastName()
            );

            employeeData.put(
                    "designation",
                    employee.getDesignation()
            );

            employeeData.put(
                    "averageSkill",
                    Math.round(averageSkill)
            );

            employeeData.put(
                    "gapStatus",
                    gapStatus
            );

            employeeOverview.add(employeeData);
        }


        /*
         * Average knowledge gap
         */

        double averageGap = 0;

        if (totalKnowledgeGaps > 0) {

            averageGap =
                    totalGapValue /
                    totalKnowledgeGaps;
        }

        averageGap =
                Math.round(averageGap * 100.0) / 100.0;


        /*
         * Top skills with knowledge gaps
         */

        List<Map<String, Object>> topSkillGaps =
                new ArrayList<>();

        for (String skillName : skillGapValues.keySet()) {

            List<Integer> values =
                    skillGapValues.get(skillName);

            int total =
                    values.stream()
                            .mapToInt(Integer::intValue)
                            .sum();

            double avg =
                    (double) total /
                    values.size();

            avg =
                    Math.round(avg * 100.0) / 100.0;

            Map<String, Object> skillData =
                    new LinkedHashMap<>();

            skillData.put(
                    "skill",
                    skillName
            );

            skillData.put(
                    "employeesAffected",
                    skillEmployeeCount.get(skillName)
            );

            skillData.put(
                    "averageGap",
                    avg
            );

            topSkillGaps.add(skillData);
        }


        /*
         * Sort skills by number of affected employees
         */

        topSkillGaps.sort(
                (a, b) ->
                        Integer.compare(
                                (Integer) b.get("employeesAffected"),
                                (Integer) a.get("employeesAffected")
                        )
        );


        /*
         * Final dashboard response
         */

        Map<String, Object> dashboard =
                new LinkedHashMap<>();

        dashboard.put(
                "totalEmployees",
                totalEmployees
        );

        dashboard.put(
                "employeesWithGaps",
                employeesWithGaps
        );

        dashboard.put(
                "averageGap",
                averageGap
        );

        dashboard.put(
                "criticalGaps",
                criticalGaps
        );

        dashboard.put(
                "totalKnowledgeGaps",
                totalKnowledgeGaps
        );

        dashboard.put(
                "performance",
                performance
        );

        dashboard.put(
                "gapDistribution",
                gapDistribution
        );

        dashboard.put(
                "topSkillGaps",
                topSkillGaps
        );

        dashboard.put(
                "employees",
                employeeOverview
        );

        return dashboard;
    }
}