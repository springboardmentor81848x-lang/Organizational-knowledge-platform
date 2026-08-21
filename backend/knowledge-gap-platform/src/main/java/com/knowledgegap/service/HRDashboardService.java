package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;

@Service
public class HRDashboardService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;

    public HRDashboardService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            AssessmentAttemptRepository assessmentAttemptRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
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

        /*
         * Average skill improvement
         */
        double totalSkillImprovement = 0;
        int employeesWithImprovement = 0;

        /*
         * Performance distribution
         */
        Map<String, Integer> performance =
                new LinkedHashMap<>();

        performance.put("excellent", 0);
        performance.put("good", 0);
        performance.put("needsAttention", 0);
        performance.put("critical", 0);

        /*
         * Knowledge gap distribution
         */
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

        /*
         * Employee overview
         */
        List<Map<String, Object>> employeeOverview =
                new ArrayList<>();


        /*
         * =====================================================
         * PROCESS EACH EMPLOYEE
         * =====================================================
         */
        for (Employee employee : employees) {

            /*
             * -------------------------------------------------
             * Employee Skills
             * -------------------------------------------------
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
             * -------------------------------------------------
             * Knowledge Gaps
             * -------------------------------------------------
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
                 * Gap Distribution
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
                 * Top Skill Gaps
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
             * -------------------------------------------------
             * Average Skill Improvement
             * -------------------------------------------------
             *
             * Compare the employee's first assessment
             * with their latest assessment.
             */
            List<AssessmentAttempt> attempts =
                    assessmentAttemptRepository
                            .findByEmployeeOrderByCompletedAtAsc(
                                    employee
                            );

            if (attempts.size() >= 2) {

                AssessmentAttempt firstAttempt =
                        attempts.get(0);

                AssessmentAttempt latestAttempt =
                        attempts.get(
                                attempts.size() - 1
                        );

                if (firstAttempt.getOverallScore() != null &&
                        latestAttempt.getOverallScore() != null) {

                    double improvement =
                            latestAttempt.getOverallScore()
                            - firstAttempt.getOverallScore();

                    totalSkillImprovement += improvement;

                    employeesWithImprovement++;
                }
            }


            /*
             * -------------------------------------------------
             * Employee Performance
             * -------------------------------------------------
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
             * -------------------------------------------------
             * Employee Gap Status
             * -------------------------------------------------
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
             * -------------------------------------------------
             * Employee Overview
             * -------------------------------------------------
             */
            Map<String, Object> employeeData =
                    new LinkedHashMap<>();

            employeeData.put(
                    "employeeId",
                    employee.getEmployeeId()
            );

            employeeData.put(
                    "employee",
                    employee.getFirstName()
                    + " "
                    + employee.getLastName()
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
         * =====================================================
         * AVERAGE KNOWLEDGE GAP
         * =====================================================
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
         * =====================================================
         * AVERAGE SKILL IMPROVEMENT
         * =====================================================
         */
        double averageSkillImprovement = 0;

        if (employeesWithImprovement > 0) {

            averageSkillImprovement =
                    totalSkillImprovement /
                    employeesWithImprovement;
        }

        averageSkillImprovement =
                Math.round(
                        averageSkillImprovement * 100.0
                ) / 100.0;


        /*
         * =====================================================
         * TOP SKILLS WITH KNOWLEDGE GAPS
         * =====================================================
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
                                (Integer) b.get(
                                        "employeesAffected"
                                ),
                                (Integer) a.get(
                                        "employeesAffected"
                                )
                        )
        );


        /*
         * =====================================================
         * FINAL DASHBOARD RESPONSE
         * =====================================================
         */
        Map<String, Object> dashboard =
                new LinkedHashMap<>();

        /*
         * KPI 1
         */
        dashboard.put(
                "totalEmployees",
                totalEmployees
        );

        /*
         * KPI 2
         */
        dashboard.put(
                "employeesWithGaps",
                employeesWithGaps
        );

        /*
         * Average gap
         */
        dashboard.put(
                "averageGap",
                averageGap
        );

        /*
         * KPI 3
         */
        dashboard.put(
                "criticalGaps",
                criticalGaps
        );

        /*
         * Total knowledge gaps
         */
        dashboard.put(
                "totalKnowledgeGaps",
                totalKnowledgeGaps
        );

        /*
         * Performance
         */
        dashboard.put(
                "performance",
                performance
        );

        /*
         * Gap distribution
         */
        dashboard.put(
                "gapDistribution",
                gapDistribution
        );

        /*
         * Top skill gaps
         */
        dashboard.put(
                "topSkillGaps",
                topSkillGaps
        );

        /*
         * Employee overview
         */
        dashboard.put(
                "employees",
                employeeOverview
        );


        /*
         * =====================================================
         * TRAINING KPIs
         * =====================================================
         *
         * Your imported database currently has no status
         * values in learning_path or learning_path_course.
         *
         * Therefore we leave these as 0 rather than inventing
         * training data.
         */

        dashboard.put(
                "employeesInTraining",
                0
        );

        dashboard.put(
                "trainingCompletionRate",
                0
        );

        dashboard.put(
                "averageLearningProgress",
                0
        );


        /*
         * =====================================================
         * KPI 7 - AVERAGE SKILL IMPROVEMENT
         * =====================================================
         */
        dashboard.put(
                "averageSkillImprovement",
                averageSkillImprovement
        );


        /*
         * =====================================================
         * KPI 8 - ACTIVE MENTORSHIPS
         * =====================================================
         *
         * No mentorship entity/table currently exists.
         */
        dashboard.put(
                "activeMentorships",
                0
        );


        return dashboard;
    }
}