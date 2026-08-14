package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class CustomQuestionnaireDto {
    private UUID id;
    private String title;
    private String description;
    private String targetRole;
    private String createdBy;
    private List<UUID> skillIds;
    private List<String> skillNames;

    public CustomQuestionnaireDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public List<UUID> getSkillIds() { return skillIds; }
    public void setSkillIds(List<UUID> skillIds) { this.skillIds = skillIds; }

    public List<String> getSkillNames() { return skillNames; }
    public void setSkillNames(List<String> skillNames) { this.skillNames = skillNames; }
}
