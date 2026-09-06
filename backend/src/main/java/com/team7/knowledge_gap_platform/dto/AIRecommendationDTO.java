package com.team7.knowledge_gap_platform.dto;

public class AIRecommendationDTO {
    private String skillName;
    private String currentLevel;
    private String requiredLevel;
    private String gapLevel;
    private int priority;
    private String recommendation;
    private String reason;

    public AIRecommendationDTO() {}

    public AIRecommendationDTO(String skillName, String currentLevel, String requiredLevel, String gapLevel, int priority, String recommendation, String reason) {
        this.skillName = skillName;
        this.currentLevel = currentLevel;
        this.requiredLevel = requiredLevel;
        this.gapLevel = gapLevel;
        this.priority = priority;
        this.recommendation = recommendation;
        this.reason = reason;
    }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(String currentLevel) { this.currentLevel = currentLevel; }

    public String getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(String requiredLevel) { this.requiredLevel = requiredLevel; }

    public String getGapLevel() { return gapLevel; }
    public void setGapLevel(String gapLevel) { this.gapLevel = gapLevel; }

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
