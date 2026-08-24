package com.knowledgegap.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_sessions")
public class KnowledgeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Session title
    @Column(nullable = false)
    private String title;

    // Session description
    @Column(length = 2000)
    private String description;

    // Employee/Mentor conducting the session
    @ManyToOne
    @JoinColumn(name = "mentor_id", nullable = false)
    private Employee mentor;

    // Date and time of the session
    @Column(nullable = false)
    private LocalDateTime sessionDate;

    // Duration in minutes
    @Column(nullable = false)
    private Integer durationMinutes;

    // Maximum number of participants
    @Column(nullable = false)
    private Integer maxParticipants;

    // Online platform: Google Meet, Microsoft Teams, Zoom
    @Column(nullable = false)
    private String platform;

    // Meeting URL
    @Column(nullable = false)
    private String meetingLink;

    // SCHEDULED, CANCELLED, COMPLETED
    @Column(nullable = false)
    private String status;

    public KnowledgeSession() {
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Employee getMentor() {
        return mentor;
    }

    public void setMentor(Employee mentor) {
        this.mentor = mentor;
    }

    public LocalDateTime getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDateTime sessionDate) {
        this.sessionDate = sessionDate;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}