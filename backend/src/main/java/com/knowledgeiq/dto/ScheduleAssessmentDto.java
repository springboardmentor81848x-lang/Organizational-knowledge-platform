package com.knowledgeiq.dto;

import java.util.UUID;

public class ScheduleAssessmentDto {
    private UUID targetUserId;
    private String targetUserEmail;
    private String title;
    private String type; // SELF_ASSESSMENT, PEER_360, MANAGER_EVALUATION
    private String scheduledDate; // YYYY-MM-DD
    private String dueDate; // YYYY-MM-DD
    private String notes;

    public ScheduleAssessmentDto() {}

    public UUID getTargetUserId() { return targetUserId; }
    public void setTargetUserId(UUID targetUserId) { this.targetUserId = targetUserId; }

    public String getTargetUserEmail() { return targetUserEmail; }
    public void setTargetUserEmail(String targetUserEmail) { this.targetUserEmail = targetUserEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(String scheduledDate) { this.scheduledDate = scheduledDate; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
