package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentorships")
public class Mentorship {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentee_id", nullable = false)
    private User mentee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(columnDefinition = "TEXT")
    private String goal;

    @Column(name = "request_message", columnDefinition = "TEXT")
    private String requestMessage;

    @Column(nullable = false)
    private String status = "REQUESTED"; // REQUESTED, ACCEPTED, REJECTED, ACTIVE, COMPLETED, CANCELLED

    @Column(name = "match_score")
    private Integer matchScore = 85;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(name = "start_date")
    private ZonedDateTime startDate;

    @Column(name = "end_date")
    private ZonedDateTime endDate;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    public Mentorship() {}

    public Mentorship(User mentor, User mentee, Skill skill, String goal, String requestMessage, Integer matchScore) {
        this.mentor = mentor;
        this.mentee = mentee;
        this.skill = skill;
        this.goal = goal;
        this.requestMessage = requestMessage;
        this.matchScore = matchScore != null ? matchScore : 85;
        this.status = "REQUESTED";
        this.createdAt = ZonedDateTime.now();
        this.updatedAt = ZonedDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = ZonedDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }

    public User getMentee() { return mentee; }
    public void setMentee(User mentee) { this.mentee = mentee; }

    public Skill getSkill() { return skill; }
    public void setSkill(Skill skill) { this.skill = skill; }

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
}
