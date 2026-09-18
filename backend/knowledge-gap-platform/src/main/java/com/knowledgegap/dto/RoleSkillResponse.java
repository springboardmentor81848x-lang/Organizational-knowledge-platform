package com.knowledgegap.dto;

public class RoleSkillResponse {

    private Long skillId;
    private String skillName;
    private String category;
    private String description;
    private Integer requiredLevel;

    public RoleSkillResponse() {
    }

    public RoleSkillResponse(
            Long skillId,
            String skillName,
            String category,
            String description,
            Integer requiredLevel) {

        this.skillId = skillId;
        this.skillName = skillName;
        this.category = category;
        this.description = description;
        this.requiredLevel = requiredLevel;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(Integer requiredLevel) {
        this.requiredLevel = requiredLevel;
    }
}