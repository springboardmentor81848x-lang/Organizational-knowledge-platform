package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.AssessmentType;
import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Department;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.LearningProgress;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;

import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentGapResultRepository;
import com.knowledgegap.repository.CompetencyRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.LearningProgressRepository;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@Service
public class ManagerDashboardService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final CompetencyRepository competencyRepository;
    private final TrainingEnrollmentRepository trainingEnrollmentRepository;
    private final LearningProgressRepository learningProgressRepository;

    // ============================================================
    // REASSESSMENT REPOSITORIES
    // ============================================================

    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AssessmentGapResultRepository assessmentGapResultRepository;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public ManagerDashboardService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            CompetencyRepository competencyRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository,
            LearningProgressRepository learningProgressRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentGapResultRepository assessmentGapResultRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRepository = competencyRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.learningProgressRepository = learningProgressRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.assessmentGapResultRepository = assessmentGapResultRepository;
    }

    // ============================================================
    // MAIN MANAGER DASHBOARD
    // ============================================================

    public ManagerDashboardResponse getDashboard(String managerEmployeeId) {

        // --------------------------------------------------------
        // 1. FIND MANAGER
        // --------------------------------------------------------

        Employee manager = employeeRepository
                .findByEmployeeId(managerEmployeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Manager not found: " + managerEmployeeId));

        // --------------------------------------------------------
        // 2. GET MANAGER'S DEPARTMENT
        // --------------------------------------------------------

        Department department = manager.getDepartment();

        if (department == null) {
            throw new RuntimeException(
                    "Manager is not assigned to any department");
        }

        Long departmentId = department.getId();

        // --------------------------------------------------------
        // 3. GET ALL EMPLOYEES IN THE DEPARTMENT
        // --------------------------------------------------------

        List<Employee> departmentEmployees =
                employeeRepository.findByDepartmentId(departmentId);

        // --------------------------------------------------------
        // 4. DEFINE MANAGER'S TEAM
        //
        // Only employees with system role EMPLOYEE are considered
        // team members.
        //
        // MANAGER         -> excluded
        // DEPARTMENT_HEAD -> excluded
        // HR              -> excluded
        // MENTOR          -> excluded
        // SYSTEM_ADMIN    -> excluded
        // EMPLOYEE        -> included
        // --------------------------------------------------------

        List<Employee> teamMembers = departmentEmployees.stream()
                .filter(employee -> employee != null)
                .filter(employee -> employee.getEmployeeId() != null)
                .filter(employee ->
                        !employee.getEmployeeId()
                                .equalsIgnoreCase(managerEmployeeId))
                .filter(employee -> employee.getRole() != null)
                .filter(employee ->
                        employee.getRole().getRoleName() != null)
                .filter(employee ->
                        "EMPLOYEE".equalsIgnoreCase(
                                employee.getRole().getRoleName()))
                .toList();

        // --------------------------------------------------------
        // 5. GET EMPLOYEE SKILLS FOR DEPARTMENT
        // --------------------------------------------------------

        List<EmployeeSkill> departmentEmployeeSkills =
                employeeSkillRepository
                        .findByEmployeeDepartmentId(departmentId);

        // --------------------------------------------------------
        // 6. PROCESS SKILL DATA ONLY FOR TEAM MEMBERS
        // --------------------------------------------------------

        Map<String, SkillAggregation> skillMap =
                new LinkedHashMap<>();

        List<HighRiskAlert> highRiskAlerts =
                new ArrayList<>();

        for (EmployeeSkill employeeSkill : departmentEmployeeSkills) {

            if (employeeSkill == null) {
                continue;
            }

            Employee employee =
                    employeeSkill.getEmployee();

            if (employee == null) {
                continue;
            }

            // Only team employees
            if (!isTeamMember(employee, teamMembers)) {
                continue;
            }

            Skill skill =
                    employeeSkill.getSkill();

            if (skill == null ||
                    skill.getSkillName() == null) {
                continue;
            }

            String skillName =
                    skill.getSkillName();

            Integer currentLevel =
                    employeeSkill.getCurrentLevel();

            if (currentLevel == null) {
                currentLevel = 0;
            }

            int requiredLevel =
                    getRequiredLevel(employee, skill);

            // ----------------------------------------------------
            // SKILL AGGREGATION
            // ----------------------------------------------------

            SkillAggregation aggregation =
                    skillMap.computeIfAbsent(
                            skillName,
                            key -> new SkillAggregation(skillName));

            aggregation.employeeCount++;
            aggregation.totalCurrentLevel += currentLevel;
            aggregation.totalRequiredLevel += requiredLevel;

            if (currentLevel >= requiredLevel) {
                aggregation.employeesMeetingRequirement++;
            } else {
                aggregation.employeesBelowRequirement++;
            }

            // ----------------------------------------------------
            // GAP CALCULATION
            // ----------------------------------------------------

            double gapPercentage = 0;

            if (requiredLevel > 0 &&
                    currentLevel < requiredLevel) {

                gapPercentage =
                        ((double) (requiredLevel - currentLevel)
                                / requiredLevel) * 100;
            }

            // ----------------------------------------------------
            // HIGH-RISK ALERT
            // ----------------------------------------------------

            if (gapPercentage >= 30) {

                String severity =
                        getSeverity(gapPercentage);

                String employeeName =
                        getEmployeeName(employee);

                highRiskAlerts.add(
                        new HighRiskAlert(
                                employee.getEmployeeId(),
                                employeeName,
                                skillName,
                                currentLevel,
                                requiredLevel,
                                Math.round(
                                        gapPercentage * 100.0)
                                        / 100.0,
                                severity));
            }
        }

        // --------------------------------------------------------
        // 7. BUILD TEAM GAP HEATMAP
        // --------------------------------------------------------

        List<TeamGapHeatmap> teamGapHeatmap =
                new ArrayList<>();

        for (SkillAggregation aggregation :
                skillMap.values()) {

            List<EmployeeSkillGap> employees =
                    new ArrayList<>();

            // ----------------------------------------------------
            // BUILD EMPLOYEE-LEVEL GAPS
            // ----------------------------------------------------

            for (EmployeeSkill employeeSkill :
                    departmentEmployeeSkills) {

                if (employeeSkill == null) {
                    continue;
                }

                Employee employee =
                        employeeSkill.getEmployee();

                if (employee == null ||
                        !isTeamMember(employee, teamMembers)) {
                    continue;
                }

                Skill skill =
                        employeeSkill.getSkill();

                if (skill == null ||
                        skill.getSkillName() == null ||
                        !skill.getSkillName()
                                .equalsIgnoreCase(
                                        aggregation.skillName)) {
                    continue;
                }

                Integer currentLevel =
                        employeeSkill.getCurrentLevel();

                if (currentLevel == null) {
                    currentLevel = 0;
                }

                int requiredLevel =
                        getRequiredLevel(employee, skill);

                double gap = 0;

                if (requiredLevel > 0 &&
                        currentLevel < requiredLevel) {

                    gap =
                            ((double) (requiredLevel - currentLevel)
                                    / requiredLevel) * 100;
                }

                employees.add(
                        new EmployeeSkillGap(
                                employee.getEmployeeId(),
                                getEmployeeName(employee),
                                Math.round(
                                        gap * 100.0)
                                        / 100.0));
            }

            // ----------------------------------------------------
            // CALCULATE AVERAGE GAP FOR THE SKILL
            // ----------------------------------------------------

            double averageCurrentLevel = 0;
            double averageRequiredLevel = 0;
            double gapPercentage = 0;

            if (aggregation.employeeCount > 0) {

                averageCurrentLevel =
                        (double) aggregation.totalCurrentLevel
                                / aggregation.employeeCount;

                averageRequiredLevel =
                        (double) aggregation.totalRequiredLevel
                                / aggregation.employeeCount;

                if (averageRequiredLevel > 0 &&
                        averageCurrentLevel < averageRequiredLevel) {

                    gapPercentage =
                            ((averageRequiredLevel -
                                    averageCurrentLevel)
                                    / averageRequiredLevel) * 100;
                }
            }

            gapPercentage =
                    Math.round(gapPercentage * 100.0) / 100.0;

            String severity =
                    getSeverity(gapPercentage);

            // ----------------------------------------------------
            // ADD SKILL TO TEAM GAP HEATMAP
            // ----------------------------------------------------

            teamGapHeatmap.add(
                    new TeamGapHeatmap(
                            aggregation.skillName,
                            gapPercentage,
                            severity,
                            employees));
        }

        // --------------------------------------------------------
        // 8. SKILL COVERAGE
        // --------------------------------------------------------

        List<SkillCoverage> skillCoverage =
                new ArrayList<>();

        int skillGapCount = 0;

        for (SkillAggregation aggregation :
                skillMap.values()) {

            if (aggregation.employeeCount == 0) {
                continue;
            }

            double averageCurrentLevel =
                    (double) aggregation.totalCurrentLevel
                            / aggregation.employeeCount;

            double averageRequiredLevel =
                    (double) aggregation.totalRequiredLevel
                            / aggregation.employeeCount;

            double coverage = 0;

            if (averageRequiredLevel > 0) {

                coverage =
                        (averageCurrentLevel
                                / averageRequiredLevel) * 100;
            }

            if (averageCurrentLevel <
                    averageRequiredLevel) {

                skillGapCount++;
            }

            skillCoverage.add(
                    new SkillCoverage(
                            aggregation.skillName,
                            Math.round(
                                    coverage * 100.0)
                                    / 100.0,
                            aggregation.employeeCount,
                            aggregation.employeesMeetingRequirement,
                            aggregation.employeesBelowRequirement));
        }

        // --------------------------------------------------------
        // 9. TRAINING DATA
        // --------------------------------------------------------

        List<TrainingEnrollment> departmentEnrollments =
                trainingEnrollmentRepository
                        .findByEmployeeDepartmentId(departmentId);

        // Only training enrollments belonging to team members
        List<TrainingEnrollment> teamEnrollments =
                departmentEnrollments.stream()
                        .filter(enrollment ->
                                enrollment != null &&
                                enrollment.getEmployee() != null)
                        .filter(enrollment ->
                                isTeamMember(
                                        enrollment.getEmployee(),
                                        teamMembers))
                        .toList();

        // --------------------------------------------------------
        // UNIQUE EMPLOYEES ENROLLED
        // --------------------------------------------------------

        Set<Long> enrolledEmployeeIds =
                new HashSet<>();

        for (TrainingEnrollment enrollment :
                teamEnrollments) {

            Employee employee =
                    enrollment.getEmployee();

            if (employee != null &&
                    employee.getId() != null) {

                enrolledEmployeeIds.add(
                        employee.getId());
            }
        }

        // --------------------------------------------------------
        // UNIQUE EMPLOYEES CURRENTLY IN TRAINING
        // --------------------------------------------------------

        Set<Long> inProgressEmployeeIds =
                new HashSet<>();

        for (TrainingEnrollment enrollment :
                teamEnrollments) {

            if (enrollment.getEmployee() == null ||
                    enrollment.getEmployee().getId() == null) {
                continue;
            }

            TrainingStatus status =
                    enrollment.getStatus();

            if (status == TrainingStatus.IN_PROGRESS ||
                    status == TrainingStatus.NOT_STARTED) {

                inProgressEmployeeIds.add(
                        enrollment.getEmployee().getId());
            }
        }

        // --------------------------------------------------------
        // UNIQUE EMPLOYEES COMPLETED TRAINING
        // --------------------------------------------------------

        Set<Long> completedEmployeeIds =
                new HashSet<>();

        for (TrainingEnrollment enrollment :
                teamEnrollments) {

            if (enrollment.getEmployee() == null ||
                    enrollment.getEmployee().getId() == null) {
                continue;
            }

            TrainingStatus status =
                    enrollment.getStatus();

            if (status == TrainingStatus.COMPLETED ||
                    status == TrainingStatus.CERTIFIED) {

                completedEmployeeIds.add(
                        enrollment.getEmployee().getId());
            }
        }

        // --------------------------------------------------------
        // TRAINING ADOPTION
        // --------------------------------------------------------

        TrainingAdoption trainingAdoption =
                new TrainingAdoption(
                        enrolledEmployeeIds.size(),
                        inProgressEmployeeIds.size(),
                        completedEmployeeIds.size());

        // --------------------------------------------------------
        // 10. TEAM PROGRESS
        //
        // Uses latest reassessment result.
        // --------------------------------------------------------

        List<EmployeeProgress> employeeProgress =
                new ArrayList<>();

        for (Employee teamMember : teamMembers) {

            EmployeeProgress progress =
                    buildEmployeeReassessmentProgress(
                            teamMember);

            employeeProgress.add(progress);
        }

        // --------------------------------------------------------
        // 11. RETURN DASHBOARD RESPONSE
        // --------------------------------------------------------

        return new ManagerDashboardResponse(
                teamMembers.size(),
                skillGapCount,
                inProgressEmployeeIds.size(),
                highRiskAlerts.size(),
                teamGapHeatmap,
                skillCoverage,
                highRiskAlerts,
                trainingAdoption,
                employeeProgress);
    }

    // ============================================================
    // BUILD EMPLOYEE REASSESSMENT PROGRESS
    // ============================================================

    private EmployeeProgress buildEmployeeReassessmentProgress(
            Employee employee) {

        String employeeId =
                employee.getEmployeeId();

        String employeeName =
                getEmployeeName(employee);

        // --------------------------------------------------------
        // FIND LATEST REASSESSMENT
        // --------------------------------------------------------

        List<AssessmentAttempt> reassessmentAttempts =
                assessmentAttemptRepository
                        .findByEmployeeAndAssessmentTypeOrderByCompletedAtDesc(
                                employee,
                                AssessmentType.REASSESSMENT);

        // --------------------------------------------------------
        // NO REASSESSMENT
        // --------------------------------------------------------

        if (reassessmentAttempts == null ||
                reassessmentAttempts.isEmpty()) {

            return new EmployeeProgress(
                    employeeId,
                    employeeName,
                    0,
                    "-",
                    "-",
                    0,
                    "Not Assessed");
        }

        // --------------------------------------------------------
        // LATEST REASSESSMENT
        // --------------------------------------------------------

        AssessmentAttempt latestAttempt =
                reassessmentAttempts.get(0);

        // --------------------------------------------------------
        // GET HISTORICAL SKILL RESULTS
        // --------------------------------------------------------

        List<AssessmentGapResult> results =
                assessmentGapResultRepository
                        .findByAttempt(latestAttempt);

        if (results == null ||
                results.isEmpty()) {

            return new EmployeeProgress(
                    employeeId,
                    employeeName,
                    0,
                    "-",
                    "-",
                    0,
                    "Not Assessed");
        }

        // --------------------------------------------------------
        // AGGREGATE REASSESSMENT DATA
        // --------------------------------------------------------

        double totalScore = 0;
        double totalPreviousLevel = 0;
        double totalAssessedLevel = 0;
        double totalImprovement = 0;

        int scoreCount = 0;
        int previousLevelCount = 0;
        int assessedLevelCount = 0;
        int improvementCount = 0;

        for (AssessmentGapResult result : results) {

            if (result == null) {
                continue;
            }

            // ----------------------------------------------------
            // ACTUAL SCORE
            // ----------------------------------------------------

            if (result.getActualScore() != null) {

                totalScore +=
                        result.getActualScore();

                scoreCount++;
            }

            // ----------------------------------------------------
            // PREVIOUS LEVEL
            // ----------------------------------------------------

            if (result.getPreviousLevel() != null) {

                totalPreviousLevel +=
                        result.getPreviousLevel();

                previousLevelCount++;
            }

            // ----------------------------------------------------
            // ASSESSED LEVEL
            // ----------------------------------------------------

            if (result.getAssessedLevel() != null) {

                totalAssessedLevel +=
                        result.getAssessedLevel();

                assessedLevelCount++;
            }

            // ----------------------------------------------------
            // IMPROVEMENT
            // ----------------------------------------------------

            if (result.getImprovement() != null) {

                totalImprovement +=
                        result.getImprovement();

                improvementCount++;
            }
        }

        // --------------------------------------------------------
        // CALCULATE OVERALL SCORE
        // --------------------------------------------------------

        double progress = 0;

        if (scoreCount > 0) {

            progress =
                    totalScore / scoreCount;
        }

        // --------------------------------------------------------
        // CALCULATE PREVIOUS LEVEL
        // --------------------------------------------------------

        double previousLevel = 0;

        if (previousLevelCount > 0) {

            previousLevel =
                    totalPreviousLevel
                            / previousLevelCount;
        }

        // --------------------------------------------------------
        // CALCULATE CURRENT / ASSESSED LEVEL
        // --------------------------------------------------------

        double assessedLevel = 0;

        if (assessedLevelCount > 0) {

            assessedLevel =
                    totalAssessedLevel
                            / assessedLevelCount;
        }

        // --------------------------------------------------------
        // CALCULATE IMPROVEMENT
        // --------------------------------------------------------

        double improvement = 0;

        if (improvementCount > 0) {

            improvement =
                    totalImprovement
                            / improvementCount;
        }

        // --------------------------------------------------------
        // DETERMINE STATUS
        // --------------------------------------------------------

        String status;

        if (improvement > 0) {

            status = "Improved";

        } else if (improvement < 0) {

            status = "Declined";

        } else {

            status = "No Change";
        }

        // --------------------------------------------------------
        // RETURN TEAM PROGRESS
        // --------------------------------------------------------

        return new EmployeeProgress(
                employeeId,
                employeeName,
                Math.round(progress * 100.0) / 100.0,
                formatLevel(previousLevel),
                formatLevel(assessedLevel),
                (int) Math.round(improvement),
                status);
    }

    // ============================================================
    // FORMAT NUMERICAL SKILL LEVEL
    // ============================================================

    private String formatLevel(double level) {

        if (level <= 0) {
            return "-";
        }

        if (level < 1.5) {
            return "Beginner";
        }

        if (level < 2.5) {
            return "Intermediate";
        }

        if (level < 3.5) {
            return "Advanced";
        }

        return "Expert";
    }

    // ============================================================
    // TEAM SKILL COVERAGE
    // ============================================================

    public TeamSkillCoverageResponse getTeamSkillCoverage(
            String managerEmployeeId) {

        ManagerDashboardResponse dashboard =
                getDashboard(managerEmployeeId);

        return new TeamSkillCoverageResponse(
                dashboard.getSkillCoverage());
    }

    // ============================================================
    // CHECK WHETHER EMPLOYEE BELONGS TO MANAGER'S TEAM
    // ============================================================

    private boolean isTeamMember(
            Employee employee,
            List<Employee> teamMembers) {

        if (employee == null ||
                employee.getId() == null) {

            return false;
        }

        return teamMembers.stream()
                .anyMatch(teamMember ->
                        teamMember != null &&
                        teamMember.getId() != null &&
                        teamMember.getId()
                                .equals(employee.getId()));
    }

    // ============================================================
    // REQUIRED SKILL LEVEL
    // ============================================================

    private int getRequiredLevel(
            Employee employee,
            Skill skill) {

        if (employee == null ||
                skill == null ||
                employee.getDesignation() == null ||
                employee.getDesignation().trim().isEmpty()) {

            return 0;
        }

        List<Competency> competencies =
                competencyRepository
                        .findByDesignation(
                                employee.getDesignation());

        if (competencies == null ||
                competencies.isEmpty()) {

            return 0;
        }

        for (Competency competency : competencies) {

            if (competency == null ||
                    competency.getSkill() == null) {

                continue;
            }

            Skill competencySkill =
                    competency.getSkill();

            // ----------------------------------------------------
            // FIRST TRY MATCHING BY SKILL ID
            // ----------------------------------------------------

            boolean sameSkill =
                    competencySkill.getId() != null &&
                    skill.getId() != null &&
                    competencySkill.getId()
                            .equals(skill.getId());

            // ----------------------------------------------------
            // FALLBACK: MATCH BY SKILL NAME
            // ----------------------------------------------------

            if (!sameSkill &&
                    competencySkill.getSkillName() != null &&
                    skill.getSkillName() != null) {

                sameSkill =
                        competencySkill.getSkillName()
                                .trim()
                                .equalsIgnoreCase(
                                        skill.getSkillName()
                                                .trim());
            }

            // ----------------------------------------------------
            // RETURN REQUIRED LEVEL
            // ----------------------------------------------------

            if (sameSkill) {

                if (competency.getRequiredLevel() == null) {
                    return 0;
                }

                return competency.getRequiredLevel();
            }
        }

        return 0;
    }

    // ============================================================
    // HIGH-RISK SEVERITY
    // ============================================================

    private String getSeverity(
            double gapPercentage) {

        if (gapPercentage >= 50) {
            return "CRITICAL";
        }

        if (gapPercentage >= 30) {
            return "HIGH";
        }

        if (gapPercentage >= 15) {
            return "MEDIUM";
        }

        if (gapPercentage > 0) {
            return "LOW";
        }

        return "NONE";
    }

    // ============================================================
    // EMPLOYEE NAME
    // ============================================================

    private String getEmployeeName(
            Employee employee) {

        if (employee == null) {
            return "";
        }

        String firstName =
                employee.getFirstName() != null
                        ? employee.getFirstName()
                        : "";

        String lastName =
                employee.getLastName() != null
                        ? employee.getLastName()
                        : "";

        return (firstName + " " + lastName).trim();
    }

    // ============================================================
    // SKILL AGGREGATION
    // ============================================================

    private static class SkillAggregation {

        private final String skillName;

        private int employeeCount = 0;
        private int totalCurrentLevel = 0;
        private int totalRequiredLevel = 0;

        private int employeesMeetingRequirement = 0;
        private int employeesBelowRequirement = 0;

        SkillAggregation(String skillName) {
            this.skillName = skillName;
        }
    }

    // ============================================================
    // DASHBOARD RESPONSE
    // ============================================================

    public static class ManagerDashboardResponse {

        private int teamSize;
        private int skillGaps;
        private int inTraining;
        private int highRiskGaps;

        private List<TeamGapHeatmap> teamGapHeatmap;
        private List<SkillCoverage> skillCoverage;
        private List<HighRiskAlert> highRiskAlerts;

        private TrainingAdoption trainingAdoption;

        private List<EmployeeProgress> employeeProgress;

        public ManagerDashboardResponse(
                int teamSize,
                int skillGaps,
                int inTraining,
                int highRiskGaps,
                List<TeamGapHeatmap> teamGapHeatmap,
                List<SkillCoverage> skillCoverage,
                List<HighRiskAlert> highRiskAlerts,
                TrainingAdoption trainingAdoption,
                List<EmployeeProgress> employeeProgress) {

            this.teamSize = teamSize;
            this.skillGaps = skillGaps;
            this.inTraining = inTraining;
            this.highRiskGaps = highRiskGaps;

            this.teamGapHeatmap = teamGapHeatmap;
            this.skillCoverage = skillCoverage;
            this.highRiskAlerts = highRiskAlerts;

            this.trainingAdoption = trainingAdoption;

            this.employeeProgress = employeeProgress;
        }

        public int getTeamSize() {
            return teamSize;
        }

        public int getSkillGaps() {
            return skillGaps;
        }

        public int getInTraining() {
            return inTraining;
        }

        public int getHighRiskGaps() {
            return highRiskGaps;
        }

        public List<TeamGapHeatmap> getTeamGapHeatmap() {
            return teamGapHeatmap;
        }

        public List<SkillCoverage> getSkillCoverage() {
            return skillCoverage;
        }

        public List<HighRiskAlert> getHighRiskAlerts() {
            return highRiskAlerts;
        }

        public TrainingAdoption getTrainingAdoption() {
            return trainingAdoption;
        }

        public List<EmployeeProgress> getEmployeeProgress() {
            return employeeProgress;
        }
    }

    // ============================================================
    // TEAM GAP HEATMAP
    // ============================================================

    public static class TeamGapHeatmap {

        private String skillName;
        private double gapPercentage;
        private String severity;
        private List<EmployeeSkillGap> employees;

        public TeamGapHeatmap(
                String skillName,
                double gapPercentage,
                String severity,
                List<EmployeeSkillGap> employees) {

            this.skillName = skillName;
            this.gapPercentage = gapPercentage;
            this.severity = severity;
            this.employees = employees;
        }

        public String getSkillName() {
            return skillName;
        }

        public double getGapPercentage() {
            return gapPercentage;
        }

        public String getSeverity() {
            return severity;
        }

        public List<EmployeeSkillGap> getEmployees() {
            return employees;
        }
    }

    // ============================================================
    // EMPLOYEE SKILL GAP
    // ============================================================

    public static class EmployeeSkillGap {

        private String employeeId;
        private String employeeName;
        private double gap;

        public EmployeeSkillGap(
                String employeeId,
                String employeeName,
                double gap) {

            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.gap = gap;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public double getGap() {
            return gap;
        }
    }

    // ============================================================
    // SKILL COVERAGE
    // ============================================================

    public static class SkillCoverage {

        private String skillName;
        private double coverage;
        private int employeeCount;
        private int employeesMeetingRequirement;
        private int employeesBelowRequirement;

        public SkillCoverage(
                String skillName,
                double coverage,
                int employeeCount,
                int employeesMeetingRequirement,
                int employeesBelowRequirement) {

            this.skillName = skillName;
            this.coverage = coverage;
            this.employeeCount = employeeCount;
            this.employeesMeetingRequirement =
                    employeesMeetingRequirement;
            this.employeesBelowRequirement =
                    employeesBelowRequirement;
        }

        public String getSkillName() {
            return skillName;
        }

        public double getCoverage() {
            return coverage;
        }

        public int getEmployeeCount() {
            return employeeCount;
        }

        public int getEmployeesMeetingRequirement() {
            return employeesMeetingRequirement;
        }

        public int getEmployeesBelowRequirement() {
            return employeesBelowRequirement;
        }
    }

    // ============================================================
    // HIGH-RISK ALERT
    // ============================================================

    public static class HighRiskAlert {

        private String employeeId;
        private String employeeName;
        private String skillName;

        private int currentLevel;
        private int requiredLevel;

        private double gapPercentage;
        private String severity;

        public HighRiskAlert(
                String employeeId,
                String employeeName,
                String skillName,
                int currentLevel,
                int requiredLevel,
                double gapPercentage,
                String severity) {

            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.skillName = skillName;
            this.currentLevel = currentLevel;
            this.requiredLevel = requiredLevel;
            this.gapPercentage = gapPercentage;
            this.severity = severity;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public String getSkillName() {
            return skillName;
        }

        public int getCurrentLevel() {
            return currentLevel;
        }

        public int getRequiredLevel() {
            return requiredLevel;
        }

        public double getGapPercentage() {
            return gapPercentage;
        }

        public String getSeverity() {
            return severity;
        }
    }

    // ============================================================
    // TRAINING ADOPTION
    // ============================================================

    public static class TrainingAdoption {

        private int enrolled;
        private int inProgress;
        private int completed;

        public TrainingAdoption(
                int enrolled,
                int inProgress,
                int completed) {

            this.enrolled = enrolled;
            this.inProgress = inProgress;
            this.completed = completed;
        }

        public int getEnrolled() {
            return enrolled;
        }

        public int getInProgress() {
            return inProgress;
        }

        public int getCompleted() {
            return completed;
        }
    }

    // ============================================================
    // EMPLOYEE / TEAM PROGRESS
    // ============================================================

    public static class EmployeeProgress {

        private String employeeId;
        private String employeeName;

        // Latest reassessment score
        private double progress;

        // Average skill level before reassessment
        private String previousLevel;

        // Average skill level after reassessment
        private String currentLevel;

        // Average improvement across skills
        private int improvement;

        // Improved / Declined / No Change / Not Assessed
        private String status;

        public EmployeeProgress(
                String employeeId,
                String employeeName,
                double progress,
                String previousLevel,
                String currentLevel,
                int improvement,
                String status) {

            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.progress = progress;
            this.previousLevel = previousLevel;
            this.currentLevel = currentLevel;
            this.improvement = improvement;
            this.status = status;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public double getProgress() {
            return progress;
        }

        public String getPreviousLevel() {
            return previousLevel;
        }

        public String getCurrentLevel() {
            return currentLevel;
        }

        public int getImprovement() {
            return improvement;
        }

        public String getStatus() {
            return status;
        }
    }

    // ============================================================
    // TEAM SKILL COVERAGE RESPONSE
    // ============================================================

    public static class TeamSkillCoverageResponse {

        private List<SkillCoverage> skillCoverage;

        public TeamSkillCoverageResponse(
                List<SkillCoverage> skillCoverage) {

            this.skillCoverage = skillCoverage;
        }

        public List<SkillCoverage> getSkillCoverage() {
            return skillCoverage;
        }
    }
}