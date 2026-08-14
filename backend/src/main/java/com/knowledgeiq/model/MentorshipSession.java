package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "mentorship_sessions")
public class MentorshipSession {

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
    @JoinColumn(name = "focus_skill_id")
    private Skill focusSkill;

    @Column(nullable = false)
    private String status = "REQUESTED"; // REQUESTED, SCHEDULED, COMPLETED, CANCELLED

    @Column(name = "scheduled_at")
    private ZonedDateTime scheduledAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public MentorshipSession() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getMentor() { return mentor; }
    public void setMentor(User mentor) { this.mentor = mentor; }

    public User getMentee() { return mentee; }
    public void setMentee(User mentee) { this.mentee = mentee; }

    public Skill getFocusSkill() { return focusSkill; }
    public void setFocusSkill(Skill focusSkill) { this.focusSkill = focusSkill; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public ZonedDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(ZonedDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
