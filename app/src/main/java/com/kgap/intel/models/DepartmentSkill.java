package com.kgap.intel.models;

public class DepartmentSkill {
    private String skillName;
    private int currentCoverage; // Percentage
    private int requiredCoverage; // Percentage
    private String category;

    public DepartmentSkill(String skillName, int currentCoverage, int requiredCoverage, String category) {
        this.skillName = skillName;
        this.currentCoverage = currentCoverage;
        this.requiredCoverage = requiredCoverage;
        this.category = category;
    }

    public String getSkillName() { return skillName; }
    public int getCurrentCoverage() { return currentCoverage; }
    public int getRequiredCoverage() { return requiredCoverage; }
    public String getCategory() { return category; }
}
