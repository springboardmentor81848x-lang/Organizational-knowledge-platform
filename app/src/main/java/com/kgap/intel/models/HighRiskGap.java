package com.kgap.intel.models;

public class HighRiskGap {
    private String skillName;
    private String riskLevel; // "Critical", "High"
    private int currentCoverage;
    private int requiredCoverage;
    private String employeeName;
    private Long employeeId;
    private Long skillId;
    private int gapScore;

    public HighRiskGap(String skillName, String riskLevel, int currentCoverage, int requiredCoverage) {
        this.skillName = skillName;
        this.riskLevel = riskLevel;
        this.currentCoverage = currentCoverage;
        this.requiredCoverage = requiredCoverage;
    }

    public HighRiskGap(String skillName, String employeeName, String riskLevel, int currentCoverage, int requiredCoverage, Long employeeId, Long skillId, int gapScore) {
        this.skillName = skillName;
        this.employeeName = employeeName;
        this.riskLevel = riskLevel;
        this.currentCoverage = currentCoverage;
        this.requiredCoverage = requiredCoverage;
        this.employeeId = employeeId;
        this.skillId = skillId;
        this.gapScore = gapScore;
    }

    public String getSkillName() { return skillName; }
    public String getRiskLevel() { return riskLevel; }
    public int getCurrentCoverage() { return currentCoverage; }
    public int getRequiredCoverage() { return requiredCoverage; }
    public String getEmployeeName() { return employeeName; }
    public Long getEmployeeId() { return employeeId; }
    public Long getSkillId() { return skillId; }
    public int getGapScore() { return gapScore; }
}
