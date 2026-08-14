package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false)
    private String type; // GAP_ALERT, TRAINING_REMINDER, MENTORSHIP_REQ

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column
    private String severity = "MEDIUM"; // CRITICAL, HIGH, MEDIUM, LOW, INFO

    @Column(name = "related_entity_type")
    private String relatedEntityType; // SKILL_GAP, RECOMMENDATION, COURSE, ASSESSMENT

    @Column(name = "related_entity_id")
    private String relatedEntityId;

    @Column(name = "action_url")
    private String actionUrl;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public Notification() {}

    public Notification(User user, String title, String message, String type) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.createdAt = ZonedDateTime.now();
    }

    public Notification(User user, String title, String message, String type, String severity, String relatedEntityType, String relatedEntityId, String actionUrl) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
        this.severity = severity != null ? severity : "MEDIUM";
        this.relatedEntityType = relatedEntityType;
        this.relatedEntityId = relatedEntityId;
        this.actionUrl = actionUrl;
        this.createdAt = ZonedDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getEventType() { return type; }

    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean isRead) { this.isRead = isRead; }

    public Boolean getRead() { return isRead; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }

    public String getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(String relatedEntityId) { this.relatedEntityId = relatedEntityId; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
