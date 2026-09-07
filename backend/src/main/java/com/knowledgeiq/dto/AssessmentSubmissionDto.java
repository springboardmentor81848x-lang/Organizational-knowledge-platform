package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class AssessmentSubmissionDto {
    private UUID assessmentId;
    private String title;
    private String type;
    private String notes;
    private List<SubmissionItem> responses;

    public AssessmentSubmissionDto() {}

    public UUID getAssessmentId() { return assessmentId; }
    public void setAssessmentId(UUID assessmentId) { this.assessmentId = assessmentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<SubmissionItem> getResponses() { return responses; }
    public void setResponses(List<SubmissionItem> responses) { this.responses = responses; }

    public static class SubmissionItem {
        private UUID skillId;
        private String skillName;
        private Integer proficiencyLevel;
        private String notes;

        public SubmissionItem() {}

        public UUID getSkillId() { return skillId; }
        public void setSkillId(UUID skillId) { this.skillId = skillId; }

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }

        public Integer getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(Integer proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }
}
