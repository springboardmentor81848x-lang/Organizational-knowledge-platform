package com.knowledgeiq.dto;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class AssessmentDto {
    private UUID id;
    private String title;
    private String type;
    private String status;
    private UUID userId;
    private String userName;
    private UUID evaluatorId;
    private String evaluatorName;
    private Double overallScore;
    private ZonedDateTime submittedAt;
    private ZonedDateTime createdAt;
    private List<AssessmentResponseItemDto> responses;

    public AssessmentDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public UUID getEvaluatorId() { return evaluatorId; }
    public void setEvaluatorId(UUID evaluatorId) { this.evaluatorId = evaluatorId; }

    public String getEvaluatorName() { return evaluatorName; }
    public void setEvaluatorName(String evaluatorName) { this.evaluatorName = evaluatorName; }

    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

    public ZonedDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(ZonedDateTime submittedAt) { this.submittedAt = submittedAt; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }

    public List<AssessmentResponseItemDto> getResponses() { return responses; }
    public void setResponses(List<AssessmentResponseItemDto> responses) { this.responses = responses; }

    public static class AssessmentResponseItemDto {
        private UUID skillId;
        private String skillName;
        private String categoryName;
        private Integer proficiencyLevel;
        private String notes;

        public AssessmentResponseItemDto() {}

        public AssessmentResponseItemDto(UUID skillId, String skillName, String categoryName, Integer proficiencyLevel, String notes) {
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

        public Integer getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(Integer proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
