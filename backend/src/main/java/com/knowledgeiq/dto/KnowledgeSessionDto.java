package com.knowledgeiq.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public class KnowledgeSessionDto {
    private UUID id;
    private String title;
    private String description;
    
    private UUID mentorId;
    private String mentorName;
    private String mentorAvatar;
    private String mentorRole;
    
    private UUID skillId;
    private String skillName;
    
    private ZonedDateTime scheduledAt;
    private Integer durationMinutes;
    private Integer capacity;
    private Long registeredCount;
    private String meetingLink;
    private String status;
    
    private Boolean isRegistered = false;
    private String userAttendanceStatus;
    
    private Double averageRating = 0.0;
    private Integer feedbackCount = 0;

    public KnowledgeSessionDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public UUID getMentorId() { return mentorId; }
    public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorAvatar() { return mentorAvatar; }
    public void setMentorAvatar(String mentorAvatar) { this.mentorAvatar = mentorAvatar; }

    public String getMentorRole() { return mentorRole; }
    public void setMentorRole(String mentorRole) { this.mentorRole = mentorRole; }

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public ZonedDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(ZonedDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Long getRegisteredCount() { return registeredCount; }
    public void setRegisteredCount(Long registeredCount) { this.registeredCount = registeredCount; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsRegistered() { return isRegistered; }
    public void setIsRegistered(Boolean registered) { isRegistered = registered; }

    public String getUserAttendanceStatus() { return userAttendanceStatus; }
    public void setUserAttendanceStatus(String userAttendanceStatus) { this.userAttendanceStatus = userAttendanceStatus; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getFeedbackCount() { return feedbackCount; }
    public void setFeedbackCount(Integer feedbackCount) { this.feedbackCount = feedbackCount; }
}
