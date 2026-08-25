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
import com.knowledgegap.entity.LearningPath;
import com.knowledgegap.entity.LearningPathCourse;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.LearningPathCourseRepository;
import com.knowledgegap.repository.LearningPathRepository;
import com.knowledgegap.repository.MentorshipRepository;

@Service
public class HRDashboardService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;

    private final LearningPathRepository learningPathRepository;
    private final LearningPathCourseRepository learningPathCourseRepository;
    private final MentorshipRepository mentorshipRepository;

    public HRDashboardService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            LearningPathRepository learningPathRepository,
            LearningPathCourseRepository learningPathCourseRepository,
            MentorshipRepository mentorshipRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;

        this.learningPathRepository = learningPathRepository;
        this.learningPathCourseRepository = learningPathCourseRepository;
        this.mentorshipRepository = mentorshipRepository;
    }

    public Map<String, Object> getDashboardSummary() {

        /*
         * =========================================================
         * EMPLOYEES
         * =========================================================
         *
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
         * =========================================================
         * SKILL IMPROVEMENT
         * =========================================================
         */
        double totalSkillImprovement = 0;
        int employeesWithImprovement = 0;

        /*
         * =========================================================
         * PERFORMANCE DISTRIBUTION
         * =========================================================
         */
        Map<String, Integer> performance =
                new LinkedHashMap<>();

        performance.put("excellent", 0);
        performance.put("good", 0);
        performance.put("needsAttention", 0);
        performance.put("critical", 0);

        /*
         * =========================================================
         * KNOWLEDGE GAP DISTRIBUTION
         * =========================================================
         */
        Map<String, Integer> gapDistribution =
                new LinkedHashMap<>();

        gapDistribution.put("low", 0);
        gapDistribution.put("medium", 0);
        gapDistribution.put("high", 0);
        gapDistribution.put("critical", 0);

        /*
         * =========================================================
         * TOP SKILL GAPS
         * =========================================================
         */
        Map<String, List<Integer>> skillGapValues =
                new HashMap<>();

        Map<String, Integer> skillEmployeeCount =
                new HashMap<>();

        /*
         * =========================================================
         * EMPLOYEE OVERVIEW
         * =========================================================
         */
        List<Map<String, Object>> employeeOverview =
                new ArrayList<>();


        /*
         * =========================================================
         * PROCESS EACH EMPLOYEE
         * =========================================================
         */
        for (Employee employee : employees) {

            /*
             * -----------------------------------------------------
             * EMPLOYEE SKILLS
             * -----------------------------------------------------
             */
            List<EmployeeSkill> employeeSkills =
                    employeeSkillRepository.findByEmployee(employee);

            double averageSkill = 0;

            if (!employeeSkills.isEmpty()) {

                int totalSkillLevel = 0;
                int validSkillCount = 0;

                for (EmployeeSkill employeeSkill : employeeSkills) {

                    if (employeeSkill.getCurrentLevel() != null) {

                        totalSkillLevel +=
                                employeeSkill.getCurrentLevel();

                        validSkillCount++;
                    }
                }

                if (validSkillCount > 0) {

                    double averageLevel =
                            (double) totalSkillLevel /
                            validSkillCount;

                    /*
                     * Level 5 = 100%
                     */
                    averageSkill =
                            (averageLevel / 5.0) * 100;
                }
            }


            /*
             * -----------------------------------------------------
             * KNOWLEDGE GAPS
             * -----------------------------------------------------
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
                 * GAP DISTRIBUTION
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
                 * TOP SKILL GAPS
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
             * -----------------------------------------------------
             * ASSESSMENT IMPROVEMENT
             * -----------------------------------------------------
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
             * -----------------------------------------------------
             * PERFORMANCE
             * -----------------------------------------------------
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
             * -----------------------------------------------------
             * EMPLOYEE GAP STATUS
             * -----------------------------------------------------
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
             * -----------------------------------------------------
             * EMPLOYEE OVERVIEW
             * -----------------------------------------------------
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
         * =========================================================
         * AVERAGE KNOWLEDGE GAP
         * =========================================================
         */
        double averageGap = 0;

        if (totalKnowledgeGaps > 0) {

            averageGap =
                    totalGapValue /
                    totalKnowledgeGaps;
        }

        averageGap =
                Math.round(
                        averageGap * 100.0
                ) / 100.0;


        /*
         * =========================================================
         * AVERAGE SKILL IMPROVEMENT
         * =========================================================
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
         * =========================================================
         * TOP SKILL GAPS
         * =========================================================
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
                    Math.round(
                            avg * 100.0
                    ) / 100.0;

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
         * Sort by employees affected
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
         * =========================================================
         * TRAINING KPIs
         * =========================================================
         */

        int employeesInTraining = 0;

        int totalCourses = 0;
        int completedCourses = 0;

        /*
         * ---------------------------------------------------------
         * PROCESS LEARNING PATHS
         * ---------------------------------------------------------
         */
        for (Employee employee : employees) {

            List<LearningPath> learningPaths =
                    learningPathRepository.findByEmployee(employee);

            boolean employeeTraining = false;

            for (LearningPath learningPath : learningPaths) {

                /*
                 * Employee is considered "in training" if
                 * learning path is active/in progress.
                 */
                if (isActiveStatus(learningPath.getStatus())) {

                    employeeTraining = true;
                }

                /*
                 * Get courses belonging to this learning path.
                 */
                List<LearningPathCourse> pathCourses =
                        learningPathCourseRepository
                                .findByLearningPathOrderBySequenceOrderAsc(
                                        learningPath
                                );

                for (LearningPathCourse pathCourse : pathCourses) {

                    totalCourses++;

                    if (isCompletedStatus(
                            pathCourse.getStatus())) {

                        completedCourses++;
                    }
                }
            }

            if (employeeTraining) {
                employeesInTraining++;
            }
        }


        /*
         * ---------------------------------------------------------
         * TRAINING COMPLETION RATE
         * ---------------------------------------------------------
         */
        double trainingCompletionRate = 0;

        if (totalCourses > 0) {

            trainingCompletionRate =
                    ((double) completedCourses /
                            totalCourses) * 100;
        }

        trainingCompletionRate =
                Math.round(
                        trainingCompletionRate * 100.0
                ) / 100.0;


        /*
         * ---------------------------------------------------------
         * AVERAGE LEARNING PROGRESS
         * ---------------------------------------------------------
         *
         * Progress = completed courses / total courses.
         */
        double averageLearningProgress = 0;

        if (totalCourses > 0) {

            averageLearningProgress =
                    ((double) completedCourses /
                            totalCourses) * 100;
        }

        averageLearningProgress =
                Math.round(
                        averageLearningProgress * 100.0
                ) / 100.0;


        /*
         * =========================================================
         * ACTIVE MENTORSHIPS
         * =========================================================
         *
         * Count mentorship records whose status is ACTIVE
         * or IN_PROGRESS.
         */
        int activeMentorships = 0;

        /*
         * We already have all employees.
         * Check mentorships belonging to each employee.
         */
        for (Employee employee : employees) {

            List<com.knowledgegap.entity.Mentorship> menteeMentorships =
                    mentorshipRepository.findByMenteeAndStatus(
                            employee,
                            "ACTIVE"
                    );

            activeMentorships +=
                    menteeMentorships.size();


            /*
             * Also support IN_PROGRESS.
             */
            List<com.knowledgegap.entity.Mentorship> inProgressMentorships =
                    mentorshipRepository.findByMenteeAndStatus(
                            employee,
                            "IN_PROGRESS"
                    );

            activeMentorships +=
                    inProgressMentorships.size();
        }


        /*
         * =========================================================
         * FINAL RESPONSE
         * =========================================================
         */
        Map<String, Object> dashboard =
                new LinkedHashMap<>();


        /*
         * =========================================================
         * MAIN KPI CARDS
         * =========================================================
         */

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


        /*
         * =========================================================
         * TRAINING KPI CARDS
         * =========================================================
         */

        dashboard.put(
                "employeesInTraining",
                employeesInTraining
        );

        dashboard.put(
                "trainingCompletionRate",
                trainingCompletionRate
        );

        dashboard.put(
                "averageLearningProgress",
                averageLearningProgress
        );


        /*
         * =========================================================
         * SKILL IMPROVEMENT
         * =========================================================
         */

        dashboard.put(
                "averageSkillImprovement",
                averageSkillImprovement
        );


        /*
         * =========================================================
         * MENTORSHIPS
         * =========================================================
         */

        dashboard.put(
                "activeMentorships",
                activeMentorships
        );


        /*
         * =========================================================
         * CHART DATA
         * =========================================================
         */

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


    /*
     * =============================================================
     * HELPER: ACTIVE LEARNING PATH STATUS
     * =============================================================
     */
    private boolean isActiveStatus(String status) {

        if (status == null) {
            return false;
        }

        String normalized =
                status.trim().toUpperCase();

        return normalized.equals("ACTIVE")
                || normalized.equals("IN_PROGRESS")
                || normalized.equals("STARTED");
    }


    /*
     * =============================================================
     * HELPER: COMPLETED COURSE STATUS
     * =============================================================
     */
    private boolean isCompletedStatus(String status) {

        if (status == null) {
            return false;
        }

        String normalized =
                status.trim().toUpperCase();

        return normalized.equals("COMPLETED")
                || normalized.equals("COMPLETE")
                || normalized.equals("DONE");
    }
}