package com.okip.dto.skillmaster;

import com.okip.enums.SkillCategory;

public class CreateSkillRequestDTO {

    private String skillName;

    private SkillCategory skillCategory;

    private String description;

    public CreateSkillRequestDTO() {
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public SkillCategory getSkillCategory() {
        return skillCategory;
    }

    public void setSkillCategory(SkillCategory skillCategory) {
        this.skillCategory = skillCategory;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}