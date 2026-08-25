package com.knowledgegap.dto;

public class SkillAssessmentRequest {

    private Long skillId;
    private Integer level;

    public SkillAssessmentRequest() {
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}