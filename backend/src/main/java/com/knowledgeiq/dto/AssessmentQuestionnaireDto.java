package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class AssessmentQuestionnaireDto {
    private String title;
    private String description;
    private List<SkillQuestionItem> skills;

    public AssessmentQuestionnaireDto() {}

    public AssessmentQuestionnaireDto(String title, String description, List<SkillQuestionItem> skills) {
        this.title = title;
        this.description = description;
        this.skills = skills;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<SkillQuestionItem> getSkills() { return skills; }
    public void setSkills(List<SkillQuestionItem> skills) { this.skills = skills; }

    public static class SkillQuestionItem {
        private UUID skillId;
        private String skillName;
        private String categoryName;
        private Integer currentProficiency;
        private Integer requiredProficiency;
        private String description;

        public SkillQuestionItem() {}

        public SkillQuestionItem(UUID skillId, String skillName, String categoryName, Integer currentProficiency, Integer requiredProficiency, String description) {
            this.skillId = skillId;
            this.skillName = skillName;
            this.categoryName = categoryName;
            this.currentProficiency = currentProficiency;
            this.requiredProficiency = requiredProficiency;
            this.description = description;
        }

        public UUID getSkillId() { return skillId; }
        public void setSkillId(UUID skillId) { this.skillId = skillId; }

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public Integer getCurrentProficiency() { return currentProficiency; }
        public void setCurrentProficiency(Integer currentProficiency) { this.currentProficiency = currentProficiency; }

        public Integer getRequiredProficiency() { return requiredProficiency; }
        public void setRequiredProficiency(Integer requiredProficiency) { this.requiredProficiency = requiredProficiency; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}
