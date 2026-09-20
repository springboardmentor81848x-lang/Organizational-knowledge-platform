package com.okip.dto.hr;

public class SkillGapSummaryDTO {
    private String skillName;
    private int affectedEmployees;
    private double averageGapPercentage;
    private String severity;

    public SkillGapSummaryDTO() {}
    public String getSkillName() { return skillName; }
    public void setSkillName(String v) { skillName = v; }
    public int getAffectedEmployees() { return affectedEmployees; }
    public void setAffectedEmployees(int v) { affectedEmployees = v; }
    public double getAverageGapPercentage() { return averageGapPercentage; }
    public void setAverageGapPercentage(double v) { averageGapPercentage = v; }
    public String getSeverity() { return severity; }
    public void setSeverity(String v) { severity = v; }
}
