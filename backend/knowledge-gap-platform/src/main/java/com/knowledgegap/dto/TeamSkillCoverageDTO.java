package com.knowledgegap.dto;

public class TeamSkillCoverageDTO {

    private String skillName;

    private double coveragePercentage;

    private double averageCurrentLevel;

    private int requiredLevel;

    private int employeeCount;

    private int employeesMeetingRequirement;

    public TeamSkillCoverageDTO() {
    }

    public TeamSkillCoverageDTO(
            String skillName,
            double coveragePercentage,
            double averageCurrentLevel,
            int requiredLevel,
            int employeeCount,
            int employeesMeetingRequirement) {

        this.skillName = skillName;
        this.coveragePercentage = coveragePercentage;
        this.averageCurrentLevel = averageCurrentLevel;
        this.requiredLevel = requiredLevel;
        this.employeeCount = employeeCount;
        this.employeesMeetingRequirement =
                employeesMeetingRequirement;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public double getCoveragePercentage() {
        return coveragePercentage;
    }

    public void setCoveragePercentage(double coveragePercentage) {
        this.coveragePercentage = coveragePercentage;
    }

    public double getAverageCurrentLevel() {
        return averageCurrentLevel;
    }

    public void setAverageCurrentLevel(double averageCurrentLevel) {
        this.averageCurrentLevel = averageCurrentLevel;
    }

    public int getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(int requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public int getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(int employeeCount) {
        this.employeeCount = employeeCount;
    }

    public int getEmployeesMeetingRequirement() {
        return employeesMeetingRequirement;
    }

    public void setEmployeesMeetingRequirement(
            int employeesMeetingRequirement) {

        this.employeesMeetingRequirement =
                employeesMeetingRequirement;
    }
}