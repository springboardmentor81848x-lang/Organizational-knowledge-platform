package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "knowledge_sessions")
public class KnowledgeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "scheduled_at", nullable = false)
    private ZonedDateTime scheduledAt;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 60;

    @Column(name = "capacity")
    private Integer capacity = 20;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(nullable = false, length = 30)
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, CANCELLED

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public KnowledgeSession() {}

    public KnowledgeSession(String title, String description, User mentor, Skill skill, ZonedDateTime scheduledAt, Integer durationMinutes, Integer capacity, String meetingLink) {
        this.title = title;
        this.description = description;
        this.mentor = mentor;
        this.skill = skill;
        this.scheduledAt = scheduledAt;
        this.durationMinutes = durationMinutes != null ? durationMinutes : 60;
        this.capacity = capacity != null ? capacity : 20;
        this.meetingLink = meetingLink;
        this.status = "SCHEDULED";
        this.createdAt = ZonedDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

    public ZonedDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(ZonedDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
