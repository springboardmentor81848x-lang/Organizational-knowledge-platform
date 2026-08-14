package com.knowledgeiq.dto;

import java.util.UUID;

public class UpdateSkillRatingDto {
    private UUID skillId;
    private String skillName;
    private String categoryName;
    private Integer proficiencyLevel;
    private String notes;

    public UpdateSkillRatingDto() {}

    public UpdateSkillRatingDto(UUID skillId, String skillName, String categoryName, Integer proficiencyLevel, String notes) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.categoryName = categoryName;
        this.proficiencyLevel = proficiencyLevel;
        this.notes = notes;
    }

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Integer getProficiencyLevel() {
        if (proficiencyLevel != null) return proficiencyLevel;
        return 3;
    }
    public void setProficiencyLevel(Integer proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public Integer getRating() { return proficiencyLevel; }
    public void setRating(Integer rating) { this.proficiencyLevel = rating; }

    public Integer getLevel() { return proficiencyLevel; }
    public void setLevel(Integer level) { this.proficiencyLevel = level; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
