package com.kgap.intel.models;

public class SkillGap {
    private String skillName;
    private String teamName;
    private String gapLevel; // "Low", "Medium", "High"
    private int gapValue; // 0-100

    public SkillGap(String skillName, String teamName, String gapLevel, int gapValue) {
        this.skillName = skillName;
        this.teamName = teamName;
        this.gapLevel = gapLevel;
        this.gapValue = gapValue;
    }

    public String getSkillName() { return skillName; }
    public String getTeamName() { return teamName; }
    public String getGapLevel() { return gapLevel; }
    public int getGapValue() { return gapValue; }
}
