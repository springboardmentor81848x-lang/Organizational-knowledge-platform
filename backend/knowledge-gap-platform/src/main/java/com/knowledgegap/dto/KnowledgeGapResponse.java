package com.knowledgegap.dto;

public class KnowledgeGapResponse {

    private String skill;
    private Integer currentLevel;
    private Integer requiredLevel;
    private Integer gap;

    public KnowledgeGapResponse() {
    }

    public KnowledgeGapResponse(String skill, Integer currentLevel, Integer requiredLevel, Integer gap) {
        this.skill = skill;
        this.currentLevel = currentLevel;
        this.requiredLevel = requiredLevel;
        this.gap = gap;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public Integer getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(Integer currentLevel) {
        this.currentLevel = currentLevel;
    }

    public Integer getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(Integer requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public Integer getGap() {
        return gap;
    }

    public void setGap(Integer gap) {
        this.gap = gap;
    }
}
