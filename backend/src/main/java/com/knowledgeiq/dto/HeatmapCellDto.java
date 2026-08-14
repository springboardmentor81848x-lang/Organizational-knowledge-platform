package com.knowledgeiq.dto;

import java.util.UUID;

public class HeatmapCellDto {
    private String row;
    private String col;
    private UUID skillId;
    private String skillName;
    private int currentLevel;
    private int requiredLevel;
    private int gap;
    private int gapPercentage;
    private String severity; // Low, Medium, High, Critical

    public HeatmapCellDto() {}

    public HeatmapCellDto(String row, String col, UUID skillId, String skillName, int currentLevel, int requiredLevel, int gap, int gapPercentage, String severity) {
        this.row = row;
        this.col = col;
        this.skillId = skillId;
        this.skillName = skillName;
        this.currentLevel = currentLevel;
        this.requiredLevel = requiredLevel;
        this.gap = gap;
        this.gapPercentage = gapPercentage;
        this.severity = severity;
    }

    public String getRow() { return row; }
    public void setRow(String row) { this.row = row; }

    public String getCol() { return col; }
    public void setCol(String col) { this.col = col; }

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public int getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(int currentLevel) { this.currentLevel = currentLevel; }

    public int getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(int requiredLevel) { this.requiredLevel = requiredLevel; }

    public int getGap() { return gap; }
    public void setGap(int gap) { this.gap = gap; }

    public int getGapPercentage() { return gapPercentage; }
    public void setGapPercentage(int gapPercentage) { this.gapPercentage = gapPercentage; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
}
