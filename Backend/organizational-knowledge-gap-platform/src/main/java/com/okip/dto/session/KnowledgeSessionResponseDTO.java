package com.okip.dto.session;

import java.time.LocalDateTime;

public class KnowledgeSessionResponseDTO {
    private Long sessionId;
    private String title;
    private String description;
    private Long skillId;
    private String skillName;
    private Long speakerId;
    private String speakerName;
    private String speakerDepartment;
    private LocalDateTime sessionDate;
    private Integer durationMinutes;
    private String meetingLink;
    private String location;
    private Integer maxParticipants;
    private Integer registeredCount;
    private String status;
    private boolean isUserRegistered;
    private Double averageRating;
    private LocalDateTime createdAt;

    public KnowledgeSessionResponseDTO() {}

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public Long getSpeakerId() { return speakerId; }
    public void setSpeakerId(Long speakerId) { this.speakerId = speakerId; }

    public String getSpeakerName() { return speakerName; }
    public void setSpeakerName(String speakerName) { this.speakerName = speakerName; }

    public String getSpeakerDepartment() { return speakerDepartment; }
    public void setSpeakerDepartment(String speakerDepartment) { this.speakerDepartment = speakerDepartment; }

    public LocalDateTime getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDateTime sessionDate) { this.sessionDate = sessionDate; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getMaxParticipants() { return maxParticipants; }
    public void setMaxParticipants(Integer maxParticipants) { this.maxParticipants = maxParticipants; }

    public Integer getRegisteredCount() { return registeredCount; }
    public void setRegisteredCount(Integer registeredCount) { this.registeredCount = registeredCount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isUserRegistered() { return isUserRegistered; }
    public void setUserRegistered(boolean userRegistered) { isUserRegistered = userRegistered; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
