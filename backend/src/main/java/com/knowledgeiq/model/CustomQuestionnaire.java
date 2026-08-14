package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "custom_questionnaires")
public class CustomQuestionnaire {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_role")
    private String targetRole;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "skill_ids_json", columnDefinition = "TEXT")
    private String skillIdsJson;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public CustomQuestionnaire() {}

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

    public String getSkillIdsJson() { return skillIdsJson; }
    public void setSkillIdsJson(String skillIdsJson) { this.skillIdsJson = skillIdsJson; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
