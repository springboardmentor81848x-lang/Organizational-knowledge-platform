package com.knowledgeiq.dto;

import java.util.UUID;

public class SkillGapDto {
    private UUID skillId;
    private String skillName;
    private String categoryName;
    private Integer currentLevel;
    private Integer requiredLevel;
    private Integer gapScore;
    private Boolean isCritical;

    public SkillGapDto(UUID skillId, String skillName, String categoryName, Integer currentLevel, Integer requiredLevel, Boolean isCritical) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.categoryName = categoryName;
        this.currentLevel = currentLevel;
        this.requiredLevel = requiredLevel;
        this.gapScore = Math.max(0, requiredLevel - currentLevel);
        this.isCritical = isCritical;
    }

    public UUID getSkillId() { return skillId; }
    public String getSkillName() { return skillName; }
    public String getCategoryName() { return categoryName; }
    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }
    public Integer getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }
    public Integer getGapScore() { return gapScore; }
    public void setGapScore(Integer gapScore) { this.gapScore = gapScore; }
    public Boolean getIsCritical() { return isCritical; }
}
