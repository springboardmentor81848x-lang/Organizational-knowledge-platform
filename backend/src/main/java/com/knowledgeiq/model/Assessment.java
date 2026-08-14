package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessments")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id")
    private User evaluator;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssessmentStatus status = AssessmentStatus.PENDING;

    @Column(name = "overall_score")
    private Double overallScore;

    @Column(name = "scheduled_for")
    private ZonedDateTime scheduledFor;

    @Column(name = "due_date")
    private ZonedDateTime dueDate;

    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "submitted_at")
    private ZonedDateTime submittedAt;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public Assessment() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getEvaluator() { return evaluator; }
    public void setEvaluator(User evaluator) { this.evaluator = evaluator; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public AssessmentType getType() { return type; }
    public void setType(AssessmentType type) { this.type = type; }

    public AssessmentStatus getStatus() { return status; }
    public void setStatus(AssessmentStatus status) { this.status = status; }

    public Double getOverallScore() { return overallScore; }
    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

    public ZonedDateTime getScheduledFor() { return scheduledFor; }
    public void setScheduledFor(ZonedDateTime scheduledFor) { this.scheduledFor = scheduledFor; }

    public ZonedDateTime getDueDate() { return dueDate; }
    public void setDueDate(ZonedDateTime dueDate) { this.dueDate = dueDate; }

    public Boolean getReminderSent() { return reminderSent; }
    public void setReminderSent(Boolean reminderSent) { this.reminderSent = reminderSent; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public ZonedDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(ZonedDateTime submittedAt) { this.submittedAt = submittedAt; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
