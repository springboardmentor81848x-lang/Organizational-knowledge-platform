package com.knowledgegap.dto;

public class RoleSkillAssessmentResponse {

    private Long skillId;
    private String skillName;
    private Integer currentLevel;
    private Integer requiredLevel;
    private Integer gapLevel;

    public RoleSkillAssessmentResponse() {
    }

    public RoleSkillAssessmentResponse(
            Long skillId,
            String skillName,
            Integer currentLevel,
            Integer requiredLevel,
            Integer gapLevel) {

        this.skillId = skillId;
        this.skillName = skillName;
        this.currentLevel = currentLevel;
        this.requiredLevel = requiredLevel;
        this.gapLevel = gapLevel;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
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

    public Integer getGapLevel() {
        return gapLevel;
    }

    public void setGapLevel(Integer gapLevel) {
        this.gapLevel = gapLevel;
    }
}
