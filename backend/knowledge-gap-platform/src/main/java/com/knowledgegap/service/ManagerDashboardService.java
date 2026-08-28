package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Department;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.CompetencyRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;

@Service
public class ManagerDashboardService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final CompetencyRepository competencyRepository;

    public ManagerDashboardService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            CompetencyRepository competencyRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRepository = competencyRepository;
    }

    // =========================================================
    // COMPLETE MANAGER DASHBOARD
    // =========================================================

    @Transactional(readOnly = true)
    public ManagerDashboardResponse getDashboard(
            String managerEmployeeId) {

        Employee manager = employeeRepository
                .findByEmployeeId(managerEmployeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Manager not found: "
                                        + managerEmployeeId
                        ));

        if (manager.getDepartment() == null) {
            throw new RuntimeException(
                    "Manager is not assigned to a department."
            );
        }

        Department department = manager.getDepartment();

        Long departmentId = department.getId();

        // =====================================================
        // TEAM MEMBERS
        // =====================================================

        List<Employee> employees =
                employeeRepository.findByDepartmentId(
                        departmentId
                );

        List<Employee> teamMembers = employees.stream()
                .filter(employee ->
                        employee != null
                                && employee.getEmployeeId() != null
                                && !employee.getEmployeeId()
                                .equals(managerEmployeeId)
                )
                .toList();

        // =====================================================
        // EMPLOYEE SKILLS
        // =====================================================

        List<EmployeeSkill> employeeSkills =
                employeeSkillRepository
                        .findByEmployeeDepartmentId(
                                departmentId
                        );

        // =====================================================
        // BUILD SKILL COVERAGE
        // =====================================================

        Map<String, SkillData> skillMap =
                new LinkedHashMap<>();

        // =====================================================
        // BUILD HIGH RISK ALERTS
        // =====================================================

        List<HighRiskAlert> highRiskAlerts =
                new ArrayList<>();

        // =====================================================
        // PROCESS EMPLOYEE SKILLS
        // =====================================================

        for (EmployeeSkill employeeSkill : employeeSkills) {

            if (employeeSkill == null) {
                continue;
            }

            Employee employee =
                    employeeSkill.getEmployee();

            if (employee == null ||
                    employee.getEmployeeId() == null) {
                continue;
            }

            // Do not include manager
            if (employee.getEmployeeId()
                    .equals(managerEmployeeId)) {
                continue;
            }

            Skill skill =
                    employeeSkill.getSkill();

            if (skill == null ||
                    skill.getSkillName() == null ||
                    skill.getSkillName().isBlank()) {
                continue;
            }

            String skillName =
                    skill.getSkillName().trim();

            // -------------------------------------------------
            // CURRENT LEVEL
            // -------------------------------------------------

            int currentLevel =
                    employeeSkill.getCurrentLevel() != null
                            ? employeeSkill.getCurrentLevel()
                            : 0;

            currentLevel = Math.max(
                    0,
                    Math.min(currentLevel, 5)
            );

            // -------------------------------------------------
            // REQUIRED LEVEL
            // -------------------------------------------------

            int requiredLevel =
                    getRequiredLevel(
                            employee,
                            skill
                    );

            // -------------------------------------------------
            // SKILL DATA
            // -------------------------------------------------

            SkillData data =
                    skillMap.computeIfAbsent(
                            skillName,
                            key -> new SkillData(skillName)
                    );

            data.employeeCount++;

            data.totalCurrentLevel +=
                    currentLevel;

            data.totalRequiredLevel +=
                    requiredLevel;

            if (requiredLevel > 0) {

                if (currentLevel >= requiredLevel) {

                    data.employeesMeetingRequirement++;

                } else {

                    data.employeesBelowRequirement++;
                }
            }

            // =================================================
            // HIGH RISK GAP
            // =================================================

            if (requiredLevel > 0 &&
                    currentLevel < requiredLevel) {

                double gapPercentage =
                        (
                                (double)
                                        (requiredLevel - currentLevel)
                                        / requiredLevel
                        ) * 100.0;

                gapPercentage =
                        round(gapPercentage);

                String severity =
                        getSeverity(gapPercentage);

                if (severity.equals("HIGH") ||
                        severity.equals("CRITICAL")) {

                    highRiskAlerts.add(
                            new HighRiskAlert(
                                    buildEmployeeName(employee),
                                    employee.getEmployeeId(),
                                    skillName,
                                    gapPercentage,
                                    severity
                            )
                    );
                }
            }
        }

        // =====================================================
        // COVERAGE + HEATMAP
        // =====================================================

        List<TeamSkillCoverageItem> skillCoverage =
                new ArrayList<>();

        List<TeamGapHeatmapItem> teamGapHeatmap =
                new ArrayList<>();

        int skillGapCount = 0;

        int highRiskGapCount =
                highRiskAlerts.size();

        for (SkillData data : skillMap.values()) {

            double averageCurrent =
                    data.employeeCount > 0
                            ? (double)
                                    data.totalCurrentLevel
                                    / data.employeeCount
                            : 0;

            double averageRequired =
                    data.employeeCount > 0
                            ? (double)
                                    data.totalRequiredLevel
                                    / data.employeeCount
                            : 0;

            averageCurrent =
                    round(averageCurrent);

            averageRequired =
                    round(averageRequired);

            // -------------------------------------------------
            // COVERAGE
            // -------------------------------------------------

            double coveragePercentage =
                    averageRequired > 0
                            ? (
                                    averageCurrent
                                            / averageRequired
                              ) * 100.0
                            : 0;

            coveragePercentage =
                    Math.min(
                            100,
                            round(coveragePercentage)
                    );

            String coverageStatus;

            if (coveragePercentage >= 80) {
                coverageStatus = "GOOD";
            } else if (coveragePercentage >= 60) {
                coverageStatus = "MODERATE";
            } else {
                coverageStatus = "LOW";
            }

            skillCoverage.add(
                    new TeamSkillCoverageItem(
                            data.skillName,
                            data.employeeCount,
                            averageCurrent,
                            averageRequired,
                            coveragePercentage,
                            data.employeesMeetingRequirement,
                            data.employeesBelowRequirement,
                            coverageStatus
                    )
            );

            // -------------------------------------------------
            // GAP HEATMAP
            // -------------------------------------------------

            double gapPercentage = 0;

            if (averageRequired > 0) {

                gapPercentage =
                        (
                                (averageRequired - averageCurrent)
                                        / averageRequired
                        ) * 100.0;

                gapPercentage =
                        Math.max(
                                0,
                                Math.min(
                                        100,
                                        gapPercentage
                                )
                        );

                gapPercentage =
                        round(gapPercentage);
            }

            if (gapPercentage > 0) {
                skillGapCount++;
            }

            String severity =
                    getSeverity(gapPercentage);

            teamGapHeatmap.add(
                    new TeamGapHeatmapItem(
                            data.skillName,
                            gapPercentage,
                            severity
                    )
            );
        }

        // =====================================================
        // SORT HIGH RISK ALERTS
        // =====================================================

        highRiskAlerts.sort(
                (a, b) ->
                        Double.compare(
                                b.getGapPercentage(),
                                a.getGapPercentage()
                        )
        );

        // =====================================================
        // SORT HEATMAP
        // =====================================================

        teamGapHeatmap.sort(
                (a, b) ->
                        Double.compare(
                                b.getGapPercentage(),
                                a.getGapPercentage()
                        )
        );

        // =====================================================
        // TRAINING
        // =====================================================
        //
        // These values are initialized safely.
        // They can later be connected to TrainingEnrollment
        // repository/service without affecting the dashboard.
        //
        // =====================================================

        TrainingAdoption trainingAdoption =
                new TrainingAdoption(
                        0,
                        0,
                        0
                );

        List<EmployeeProgress> employeeProgress =
                new ArrayList<>();

        // =====================================================
        // RETURN COMPLETE DASHBOARD
        // =====================================================

        return new ManagerDashboardResponse(

                manager.getEmployeeId(),

                buildEmployeeName(manager),

                department.getId(),

                department.getDepartmentName(),

                teamMembers.size(),

                skillGapCount,

                trainingAdoption.getInProgress(),

                highRiskGapCount,

                teamGapHeatmap,

                skillCoverage,

                highRiskAlerts,

                trainingAdoption,

                employeeProgress
        );
    }

    // =========================================================
    // TEAM SKILL COVERAGE
    // =========================================================

    @Transactional(readOnly = true)
    public TeamSkillCoverageResponse getTeamSkillCoverage(
            String managerEmployeeId) {

        ManagerDashboardResponse dashboard =
                getDashboard(managerEmployeeId);

        return new TeamSkillCoverageResponse(
                dashboard.getManagerEmployeeId(),
                dashboard.getManagerName(),
                dashboard.getDepartmentId(),
                dashboard.getDepartmentName(),
                dashboard.getTeamSize(),
                dashboard.getSkillCoverage(),
                calculateOverallCoverage(
                        dashboard.getSkillCoverage()
                ),
                calculateTotalMeeting(
                        dashboard.getSkillCoverage()
                ),
                calculateTotalRecords(
                        dashboard.getSkillCoverage()
                )
        );
    }

    // =========================================================
    // REQUIRED LEVEL
    // =========================================================

    private int getRequiredLevel(
            Employee employee,
            Skill skill) {

        if (employee == null ||
                skill == null) {
            return 0;
        }

        if (employee.getDesignation() == null ||
                employee.getDesignation().isBlank()) {
            return 0;
        }

        List<Competency> competencies =
                competencyRepository.findByDesignation(
                        employee.getDesignation()
                );

        for (Competency competency : competencies) {

            if (competency == null ||
                    competency.getSkill() == null ||
                    competency.getSkill().getId() == null ||
                    skill.getId() == null) {
                continue;
            }

            if (competency.getSkill()
                    .getId()
                    .equals(skill.getId())) {

                Integer requiredLevel =
                        competency.getRequiredLevel();

                if (requiredLevel == null) {
                    return 0;
                }

                return Math.max(
                        0,
                        Math.min(
                                requiredLevel,
                                5
                        )
                );
            }
        }

        return 0;
    }

    // =========================================================
    // SEVERITY
    // =========================================================

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

    // =========================================================
    // EMPLOYEE NAME
    // =========================================================

    private String buildEmployeeName(
            Employee employee) {

        String firstName =
                employee.getFirstName() != null
                        ? employee.getFirstName().trim()
                        : "";

        String lastName =
                employee.getLastName() != null
                        ? employee.getLastName().trim()
                        : "";

        String name =
                (firstName + " " + lastName).trim();

        if (name.isBlank()) {
            return employee.getEmployeeId();
        }

        return name;
    }

    // =========================================================
    // ROUND
    // =========================================================

    private double round(double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }

    // =========================================================
    // OVERALL COVERAGE
    // =========================================================

    private double calculateOverallCoverage(
            List<TeamSkillCoverageItem> skills) {

        if (skills == null || skills.isEmpty()) {
            return 0;
        }

        double current = 0;
        double required = 0;

        for (TeamSkillCoverageItem skill : skills) {

            current += skill.getAverageCurrentLevel();
            required += skill.getAverageRequiredLevel();
        }

        if (required == 0) {
            return 0;
        }

        return Math.min(
                100,
                round((current / required) * 100)
        );
    }

    private int calculateTotalMeeting(
            List<TeamSkillCoverageItem> skills) {

        int total = 0;

        for (TeamSkillCoverageItem skill : skills) {
            total += skill.getEmployeesMeetingRequirement();
        }

        return total;
    }

    private int calculateTotalRecords(
            List<TeamSkillCoverageItem> skills) {

        int total = 0;

        for (TeamSkillCoverageItem skill : skills) {
            total += skill.getEmployeeCount();
        }

        return total;
    }

    // =========================================================
    // INTERNAL SKILL DATA
    // =========================================================

    private static class SkillData {

        private final String skillName;

        private int employeeCount;

        private int totalCurrentLevel;

        private int totalRequiredLevel;

        private int employeesMeetingRequirement;

        private int employeesBelowRequirement;

        SkillData(String skillName) {
            this.skillName = skillName;
        }
    }

    // =========================================================
    // COMPLETE DASHBOARD RESPONSE
    // =========================================================

    public static class ManagerDashboardResponse {

        private String managerEmployeeId;
        private String managerName;

        private Long departmentId;
        private String departmentName;

        private int teamSize;
        private int skillGaps;
        private int inTraining;
        private int highRiskGaps;

        private List<TeamGapHeatmapItem> teamGapHeatmap;
        private List<TeamSkillCoverageItem> skillCoverage;
        private List<HighRiskAlert> highRiskAlerts;

        private TrainingAdoption trainingAdoption;

        private List<EmployeeProgress> employeeProgress;

        public ManagerDashboardResponse(
                String managerEmployeeId,
                String managerName,
                Long departmentId,
                String departmentName,
                int teamSize,
                int skillGaps,
                int inTraining,
                int highRiskGaps,
                List<TeamGapHeatmapItem> teamGapHeatmap,
                List<TeamSkillCoverageItem> skillCoverage,
                List<HighRiskAlert> highRiskAlerts,
                TrainingAdoption trainingAdoption,
                List<EmployeeProgress> employeeProgress) {

            this.managerEmployeeId = managerEmployeeId;
            this.managerName = managerName;
            this.departmentId = departmentId;
            this.departmentName = departmentName;
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

        public String getManagerEmployeeId() {
            return managerEmployeeId;
        }

        public String getManagerName() {
            return managerName;
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public String getDepartmentName() {
            return departmentName;
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

        public List<TeamGapHeatmapItem> getTeamGapHeatmap() {
            return teamGapHeatmap;
        }

        public List<TeamSkillCoverageItem> getSkillCoverage() {
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

    // =========================================================
    // TEAM GAP HEATMAP
    // =========================================================

    public static class TeamGapHeatmapItem {

        private String skillName;
        private double gapPercentage;
        private String severity;

        public TeamGapHeatmapItem(
                String skillName,
                double gapPercentage,
                String severity) {

            this.skillName = skillName;
            this.gapPercentage = gapPercentage;
            this.severity = severity;
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
    }

    // =========================================================
    // HIGH RISK ALERT
    // =========================================================

    public static class HighRiskAlert {

        private String employeeName;
        private String employeeId;
        private String skillName;
        private double gapPercentage;
        private String severity;

        public HighRiskAlert(
                String employeeName,
                String employeeId,
                String skillName,
                double gapPercentage,
                String severity) {

            this.employeeName = employeeName;
            this.employeeId = employeeId;
            this.skillName = skillName;
            this.gapPercentage = gapPercentage;
            this.severity = severity;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public String getEmployeeId() {
            return employeeId;
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
    }

    // =========================================================
    // TRAINING ADOPTION
    // =========================================================

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

    // =========================================================
    // EMPLOYEE PROGRESS
    // =========================================================

    public static class EmployeeProgress {

        private String employeeName;
        private String employeeId;
        private double progressPercentage;

        public EmployeeProgress(
                String employeeName,
                String employeeId,
                double progressPercentage) {

            this.employeeName = employeeName;
            this.employeeId = employeeId;
            this.progressPercentage = progressPercentage;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public double getProgressPercentage() {
            return progressPercentage;
        }
    }

    // =========================================================
    // TEAM SKILL COVERAGE RESPONSE
    // =========================================================

    public static class TeamSkillCoverageResponse {

        private String managerEmployeeId;
        private String managerName;
        private Long departmentId;
        private String departmentName;
        private int teamSize;

        private List<TeamSkillCoverageItem> skills;

        private double overallCoverage;

        private int totalEmployeesMeetingRequirement;

        private int totalSkillRecords;

        public TeamSkillCoverageResponse(
                String managerEmployeeId,
                String managerName,
                Long departmentId,
                String departmentName,
                int teamSize,
                List<TeamSkillCoverageItem> skills,
                double overallCoverage,
                int totalEmployeesMeetingRequirement,
                int totalSkillRecords) {

            this.managerEmployeeId = managerEmployeeId;
            this.managerName = managerName;
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.teamSize = teamSize;
            this.skills = skills;
            this.overallCoverage = overallCoverage;
            this.totalEmployeesMeetingRequirement =
                    totalEmployeesMeetingRequirement;
            this.totalSkillRecords = totalSkillRecords;
        }

        public String getManagerEmployeeId() {
            return managerEmployeeId;
        }

        public String getManagerName() {
            return managerName;
        }

        public Long getDepartmentId() {
            return departmentId;
        }

        public String getDepartmentName() {
            return departmentName;
        }

        public int getTeamSize() {
            return teamSize;
        }

        public List<TeamSkillCoverageItem> getSkills() {
            return skills;
        }

        public double getOverallCoverage() {
            return overallCoverage;
        }

        public int getTotalEmployeesMeetingRequirement() {
            return totalEmployeesMeetingRequirement;
        }

        public int getTotalSkillRecords() {
            return totalSkillRecords;
        }
    }

    // =========================================================
    // TEAM SKILL COVERAGE ITEM
    // =========================================================

    public static class TeamSkillCoverageItem {

        private String skillName;
        private int employeeCount;

        private double averageCurrentLevel;
        private double averageRequiredLevel;

        private double coveragePercentage;

        private int employeesMeetingRequirement;
        private int employeesBelowRequirement;

        private String status;

        public TeamSkillCoverageItem(
                String skillName,
                int employeeCount,
                double averageCurrentLevel,
                double averageRequiredLevel,
                double coveragePercentage,
                int employeesMeetingRequirement,
                int employeesBelowRequirement,
                String status) {

            this.skillName = skillName;
            this.employeeCount = employeeCount;
            this.averageCurrentLevel = averageCurrentLevel;
            this.averageRequiredLevel = averageRequiredLevel;
            this.coveragePercentage = coveragePercentage;
            this.employeesMeetingRequirement =
                    employeesMeetingRequirement;
            this.employeesBelowRequirement =
                    employeesBelowRequirement;
            this.status = status;
        }

        public String getSkillName() {
            return skillName;
        }

        public int getEmployeeCount() {
            return employeeCount;
        }

        public double getAverageCurrentLevel() {
            return averageCurrentLevel;
        }

        public double getAverageRequiredLevel() {
            return averageRequiredLevel;
        }

        public double getCoveragePercentage() {
            return coveragePercentage;
        }

        public int getEmployeesMeetingRequirement() {
            return employeesMeetingRequirement;
        }

        public int getEmployeesBelowRequirement() {
            return employeesBelowRequirement;
        }

        public String getStatus() {
            return status;
        }
    }
}