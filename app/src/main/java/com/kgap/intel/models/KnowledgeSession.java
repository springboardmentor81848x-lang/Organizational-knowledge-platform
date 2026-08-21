package com.kgap.intel.models;

import java.io.Serializable;

public class KnowledgeSession implements Serializable {
    private Long id;
    private String title;
    private String description;
    private String topic;
    private Long createdByEmployeeId;
    private String scheduledAt; // Using String to match ISO LocalDateTime format
    private Integer durationMinutes;
    private String meetingLink;
    private Integer maxParticipants;
    private String status;
    private String createdAt;

    public KnowledgeSession() {}

    // Constructor for creation
    public KnowledgeSession(String title, String description, String topic, Long createdByEmployeeId, String scheduledAt, Integer durationMinutes, String meetingLink, Integer maxParticipants) {
        this.title = title;
        this.description = description;
        this.topic = topic;
        this.createdByEmployeeId = createdByEmployeeId;
        this.scheduledAt = scheduledAt;
        this.durationMinutes = durationMinutes;
        this.meetingLink = meetingLink;
        this.maxParticipants = maxParticipants;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public Long getCreatedByEmployeeId() { return createdByEmployeeId; }
    public void setCreatedByEmployeeId(Long createdByEmployeeId) { this.createdByEmployeeId = createdByEmployeeId; }
    public String getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(String scheduledAt) { this.scheduledAt = scheduledAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
