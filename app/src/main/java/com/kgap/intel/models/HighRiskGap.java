package com.kgap.intel.models;

public class HighRiskGap {
    private String skillName;
    private String riskLevel; // "Critical", "High"
    private int currentCoverage;
    private int requiredCoverage;

    public HighRiskGap(String skillName, String riskLevel, int currentCoverage, int requiredCoverage) {
        this.skillName = skillName;
        this.riskLevel = riskLevel;
        this.currentCoverage = currentCoverage;
        this.requiredCoverage = requiredCoverage;
    }

    public String getSkillName() { return skillName; }
    public String getRiskLevel() { return riskLevel; }
    public int getCurrentCoverage() { return currentCoverage; }
    public int getRequiredCoverage() { return requiredCoverage; }
}
