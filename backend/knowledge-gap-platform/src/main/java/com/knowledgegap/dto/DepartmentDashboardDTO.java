package com.knowledgegap.dto;

import java.util.List;

public class DepartmentDashboardDTO {

    // =========================================================
    // DEPARTMENT INFORMATION
    // =========================================================

    private Long departmentId;
    private String departmentName;
    private String departmentDescription;

    // =========================================================
    // EMPLOYEE METRICS
    // =========================================================

    private long totalEmployees;

    // =========================================================
    // TRAINING METRICS
    // =========================================================

    private long trainingEnrolled;
    private long trainingCompleted;
    private double averageLearningProgress;

    // =========================================================
    // KNOWLEDGE GAP METRICS
    // =========================================================

    private long criticalSkillGaps;
    private String topGap;
    private long topGapCount;

    // =========================================================
    // TEAM SKILL GAP HEATMAP
    // =========================================================

    private List<TeamSkillGapDTO> teamSkillGapMap;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public DepartmentDashboardDTO() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentDescription() {
        return departmentDescription;
    }

    public void setDepartmentDescription(String departmentDescription) {
        this.departmentDescription = departmentDescription;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getTrainingEnrolled() {
        return trainingEnrolled;
    }

    public void setTrainingEnrolled(long trainingEnrolled) {
        this.trainingEnrolled = trainingEnrolled;
    }

    public long getTrainingCompleted() {
        return trainingCompleted;
    }

    public void setTrainingCompleted(long trainingCompleted) {
        this.trainingCompleted = trainingCompleted;
    }

    public double getAverageLearningProgress() {
        return averageLearningProgress;
    }

    public void setAverageLearningProgress(double averageLearningProgress) {
        this.averageLearningProgress = averageLearningProgress;
    }

    public long getCriticalSkillGaps() {
        return criticalSkillGaps;
    }

    public void setCriticalSkillGaps(long criticalSkillGaps) {
        this.criticalSkillGaps = criticalSkillGaps;
    }

    public String getTopGap() {
        return topGap;
    }

    public void setTopGap(String topGap) {
        this.topGap = topGap;
    }

    public long getTopGapCount() {
        return topGapCount;
    }

    public void setTopGapCount(long topGapCount) {
        this.topGapCount = topGapCount;
    }

    public List<TeamSkillGapDTO> getTeamSkillGapMap() {
        return teamSkillGapMap;
    }

    public void setTeamSkillGapMap(List<TeamSkillGapDTO> teamSkillGapMap) {
        this.teamSkillGapMap = teamSkillGapMap;
    }

    // =========================================================
    // TEAM SKILL GAP DTO
    // =========================================================

    public static class TeamSkillGapDTO {

        private String skillName;
        private List<EmployeeSkillGapDTO> employees;

        public TeamSkillGapDTO() {
        }

        public TeamSkillGapDTO(
                String skillName,
                List<EmployeeSkillGapDTO> employees) {

            this.skillName = skillName;
            this.employees = employees;
        }

        public String getSkillName() {
            return skillName;
        }

        public void setSkillName(String skillName) {
            this.skillName = skillName;
        }

        public List<EmployeeSkillGapDTO> getEmployees() {
            return employees;
        }

        public void setEmployees(
                List<EmployeeSkillGapDTO> employees) {

            this.employees = employees;
        }
    }

    // =========================================================
    // EMPLOYEE SKILL GAP DTO
    // =========================================================

    public static class EmployeeSkillGapDTO {

        private String employeeId;
        private String employeeName;
        private Integer gap;

        public EmployeeSkillGapDTO() {
        }

        public EmployeeSkillGapDTO(
                String employeeId,
                String employeeName,
                Integer gap) {

            this.employeeId = employeeId;
            this.employeeName = employeeName;
            this.gap = gap;
        }

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public void setEmployeeName(String employeeName) {
            this.employeeName = employeeName;
        }

        public Integer getGap() {
            return gap;
        }

        public void setGap(Integer gap) {
            this.gap = gap;
        }
    }
}