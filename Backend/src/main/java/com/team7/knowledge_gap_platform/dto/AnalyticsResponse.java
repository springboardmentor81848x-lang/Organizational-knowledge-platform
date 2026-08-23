package com.team7.knowledge_gap_platform.dto;

public class AnalyticsResponse {

    private Long employeeId;

    private String employeeName;
    private String department;

    private Integer totalSkills;
    private Integer totalSkillGaps;

    private Integer highGaps;
    private Integer mediumGaps;
    private Integer lowGaps;

    private Integer totalTrainings;
    private Integer completedTrainings;
    private Integer inProgressTrainings;

    private Double averageSkillScore;

    public AnalyticsResponse() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getTotalSkills() {
        return totalSkills;
    }

    public void setTotalSkills(Integer totalSkills) {
        this.totalSkills = totalSkills;
    }

    public Integer getTotalSkillGaps() {
        return totalSkillGaps;
    }

    public void setTotalSkillGaps(Integer totalSkillGaps) {
        this.totalSkillGaps = totalSkillGaps;
    }

    public Integer getHighGaps() {
        return highGaps;
    }

    public void setHighGaps(Integer highGaps) {
        this.highGaps = highGaps;
    }

    public Integer getMediumGaps() {
        return mediumGaps;
    }

    public void setMediumGaps(Integer mediumGaps) {
        this.mediumGaps = mediumGaps;
    }

    public Integer getLowGaps() {
        return lowGaps;
    }

    public void setLowGaps(Integer lowGaps) {
        this.lowGaps = lowGaps;
    }

    public Integer getTotalTrainings() {
        return totalTrainings;
    }

    public void setTotalTrainings(Integer totalTrainings) {
        this.totalTrainings = totalTrainings;
    }

    public Integer getCompletedTrainings() {
        return completedTrainings;
    }

    public void setCompletedTrainings(Integer completedTrainings) {
        this.completedTrainings = completedTrainings;
    }

    public Integer getInProgressTrainings() {
        return inProgressTrainings;
    }

    public void setInProgressTrainings(Integer inProgressTrainings) {
        this.inProgressTrainings = inProgressTrainings;
    }

    public Double getAverageSkillScore() {
        return averageSkillScore;
    }

    public void setAverageSkillScore(Double averageSkillScore) {
        this.averageSkillScore = averageSkillScore;
    }
}