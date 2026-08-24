package com.knowledgeiq.dto;

import java.time.ZonedDateTime;
import java.util.UUID;

public class MentorshipDto {
    private UUID id;
    
    private UUID mentorId;
    private String mentorName;
    private String mentorAvatar;
    private String mentorRole;
    private String mentorEmail;
    
    private UUID menteeId;
    private String menteeName;
    private String menteeAvatar;
    private String menteeRole;
    private String menteeEmail;
    
    private UUID skillId;
    private String skillName;
    private String skillCategory;
    
    private String goal;
    private String requestMessage;
    private String status;
    private Integer matchScore;
    private String meetingLink;
    
    private ZonedDateTime startDate;
    private ZonedDateTime endDate;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    private String assignedByName; // L&D Admin name who assigned this (null for self-requested)

    public MentorshipDto() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getMentorId() { return mentorId; }
    public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorAvatar() { return mentorAvatar; }
    public void setMentorAvatar(String mentorAvatar) { this.mentorAvatar = mentorAvatar; }

    public String getMentorRole() { return mentorRole; }
    public void setMentorRole(String mentorRole) { this.mentorRole = mentorRole; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public UUID getMenteeId() { return menteeId; }
    public void setMenteeId(UUID menteeId) { this.menteeId = menteeId; }

    public String getMenteeName() { return menteeName; }
    public void setMenteeName(String menteeName) { this.menteeName = menteeName; }

    public String getMenteeAvatar() { return menteeAvatar; }
    public void setMenteeAvatar(String menteeAvatar) { this.menteeAvatar = menteeAvatar; }

    public String getMenteeRole() { return menteeRole; }
    public void setMenteeRole(String menteeRole) { this.menteeRole = menteeRole; }

    public String getMenteeEmail() { return menteeEmail; }
    public void setMenteeEmail(String menteeEmail) { this.menteeEmail = menteeEmail; }

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getSkillCategory() { return skillCategory; }
    public void setSkillCategory(String skillCategory) { this.skillCategory = skillCategory; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getRequestMessage() { return requestMessage; }
    public void setRequestMessage(String requestMessage) { this.requestMessage = requestMessage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getMatchScore() { return matchScore; }
    public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public ZonedDateTime getStartDate() { return startDate; }
    public void setStartDate(ZonedDateTime startDate) { this.startDate = startDate; }

    public ZonedDateTime getEndDate() { return endDate; }
    public void setEndDate(ZonedDateTime endDate) { this.endDate = endDate; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }

    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getAssignedByName() { return assignedByName; }
    public void setAssignedByName(String assignedByName) { this.assignedByName = assignedByName; }
}
