package com.knowledgeiq.dto;

import java.util.UUID;

public class LearningMilestoneDto {
    private UUID id;
    private UUID courseId;
    private String title;
    private String description;
    private Integer sequenceOrder;
    private Integer completionPercentage;
    private Boolean isCompleted = false;

    public LearningMilestoneDto() {}

    public LearningMilestoneDto(UUID id, UUID courseId, String title, String description, Integer sequenceOrder, Integer completionPercentage, Boolean isCompleted) {
        this.id = id;
        this.courseId = courseId;
        this.title = title;
        this.description = description;
        this.sequenceOrder = sequenceOrder;
        this.completionPercentage = completionPercentage;
        this.isCompleted = isCompleted;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }

    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }
}
