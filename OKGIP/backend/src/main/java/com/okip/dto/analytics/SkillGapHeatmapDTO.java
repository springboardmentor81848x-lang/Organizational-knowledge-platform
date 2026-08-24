package com.okip.dto.analytics;

public class SkillGapHeatmapDTO {

    private String skillName;

    private double averageGapPercentage;

    private int employeeCount;

    public SkillGapHeatmapDTO() {
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public double getAverageGapPercentage() {
        return averageGapPercentage;
    }

    public void setAverageGapPercentage(
            double averageGapPercentage) {

        this.averageGapPercentage =
                averageGapPercentage;
    }

    public int getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(
            int employeeCount) {

        this.employeeCount =
                employeeCount;
    }
}