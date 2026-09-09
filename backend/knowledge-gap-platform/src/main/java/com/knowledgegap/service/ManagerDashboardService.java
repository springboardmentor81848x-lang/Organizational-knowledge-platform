package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Department;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.LearningProgress;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
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

    public ManagerDashboardService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            CompetencyRepository competencyRepository,
            TrainingEnrollmentRepository trainingEnrollmentRepository,
            LearningProgressRepository learningProgressRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRepository = competencyRepository;
        this.trainingEnrollmentRepository = trainingEnrollmentRepository;
        this.learningProgressRepository = learningProgressRepository;
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
        // Therefore:
        // MANAGER            -> excluded
        // DEPARTMENT_HEAD    -> excluded
        // HR                 -> excluded
        // MENTOR             -> excluded
        // SYSTEM_ADMIN       -> excluded
        // EMPLOYEE           -> included
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

            Employee employee = employeeSkill.getEmployee();

            if (employee == null) {
                continue;
            }

            // Only team employees
            if (!isTeamMember(employee, teamMembers)) {
                continue;
            }

            Skill skill = employeeSkill.getSkill();

            if (skill == null || skill.getSkillName() == null) {
                continue;
            }

            String skillName = skill.getSkillName();

            Integer currentLevel = employeeSkill.getCurrentLevel();

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

            if (requiredLevel > 0 && currentLevel < requiredLevel) {

                gapPercentage =
                        ((double) (requiredLevel - currentLevel)
                                / requiredLevel) * 100;
            }

            // ----------------------------------------------------
            // HIGH-RISK ALERT
            // ----------------------------------------------------

            if (gapPercentage >= 30) {

                String severity = getSeverity(gapPercentage);

                String employeeName =
                        getEmployeeName(employee);

                highRiskAlerts.add(
                        new HighRiskAlert(
                                employee.getEmployeeId(),
                                employeeName,
                                skillName,
                                currentLevel,
                                requiredLevel,
                                Math.round(gapPercentage * 100.0) / 100.0,
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
                                .equals(aggregation.skillName)) {
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
                                Math.round(gap * 100.0) / 100.0));
            }

            teamGapHeatmap.add(
                    new TeamGapHeatmap(
                            aggregation.skillName,
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

            if (averageCurrentLevel < averageRequiredLevel) {
                skillGapCount++;
            }

            skillCoverage.add(
                    new SkillCoverage(
                            aggregation.skillName,
                            Math.round(coverage * 100.0) / 100.0,
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

        java.util.Set<Long> enrolledEmployeeIds =
                new java.util.HashSet<>();

        for (TrainingEnrollment enrollment :
                teamEnrollments) {

            Employee employee =
                    enrollment.getEmployee();

            if (employee != null &&
                    employee.getId() != null) {

                enrolledEmployeeIds.add(employee.getId());
            }
        }

        // --------------------------------------------------------
        // UNIQUE EMPLOYEES CURRENTLY IN TRAINING
        // --------------------------------------------------------

        java.util.Set<Long> inProgressEmployeeIds =
                new java.util.HashSet<>();

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

        java.util.Set<Long> completedEmployeeIds =
                new java.util.HashSet<>();

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
        // 10. EMPLOYEE PROGRESS
        // --------------------------------------------------------

        List<EmployeeProgress> employeeProgress =
                new ArrayList<>();

        for (Employee teamMember : teamMembers) {

            List<LearningProgress> progressRecords =
                    learningProgressRepository
                            .findByEmployee(teamMember);

            double averageProgress = 0;

            if (progressRecords != null &&
                    !progressRecords.isEmpty()) {

                double totalProgress = 0;
                int count = 0;

                for (LearningProgress progress :
                        progressRecords) {

                    if (progress == null ||
                            progress.getProgressPercentage() == null) {
                        continue;
                    }

                    totalProgress +=
                            progress.getProgressPercentage();

                    count++;
                }

                if (count > 0) {
                    averageProgress =
                            totalProgress / count;
                }
            }

            employeeProgress.add(
                    new EmployeeProgress(
                            teamMember.getEmployeeId(),
                            getEmployeeName(teamMember),
                            Math.round(
                                    averageProgress * 100.0)
                                    / 100.0));
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
                employee.getDesignation() == null) {

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

            if (competency == null) {
                continue;
            }

            if (competency.getSkill() == null) {
                continue;
            }

            if (competency.getSkill().getId() == null ||
                    skill.getId() == null) {
                continue;
            }

            if (competency.getSkill().getId()
                    .equals(skill.getId())) {

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

    private String getSeverity(double gapPercentage) {

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

    private String getEmployeeName(Employee employee) {

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
        private List<EmployeeSkillGap> employees;

        public TeamGapHeatmap(
                String skillName,
                List<EmployeeSkillGap> employees) {

            this.skillName = skillName;
            this.employees = employees;
        }

        public String getSkillName() {
            return skillName;
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
    // EMPLOYEE PROGRESS
    // ============================================================

    public static class EmployeeProgress {

        private String employeeId;
        private String employeeName;
        private double progress;

        public EmployeeProgress(
                String employeeId,
                String employeeName,
                double progress) {

            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.progress = progress;
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