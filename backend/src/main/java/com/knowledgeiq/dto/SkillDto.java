package com.knowledgeiq.dto;

import java.util.UUID;

public class SkillDto {
    private UUID id;
    private String skillName;
    private String categoryName;
    private String currentProficiency;
    private String requiredProficiency;
    private Boolean isCritical;
    private Integer proficiencyLevel;

    public SkillDto() {}

    public SkillDto(UUID id, String skillName, String categoryName, Integer proficiencyLevel) {
        this.id = id;
        this.skillName = skillName;
        this.categoryName = categoryName;
        this.proficiencyLevel = proficiencyLevel;
        this.currentProficiency = proficiencyLevel != null ? proficiencyLevel.toString() : "1";
    }

    public SkillDto(UUID id, String skillName, String categoryName, String currentProficiency, String requiredProficiency, Boolean isCritical) {
        this.id = id;
        this.skillName = skillName;
        this.categoryName = categoryName;
        this.currentProficiency = currentProficiency;
        this.requiredProficiency = requiredProficiency;
        this.isCritical = isCritical;
    }

    public UUID getId() { return id; }
    public String getSkillName() { return skillName; }
    public String getCategoryName() { return categoryName; }
    public String getCurrentProficiency() { return currentProficiency; }
    public String getRequiredProficiency() { return requiredProficiency; }
    public Boolean getIsCritical() { return isCritical; }
    public Integer getProficiencyLevel() { return proficiencyLevel; }
}
