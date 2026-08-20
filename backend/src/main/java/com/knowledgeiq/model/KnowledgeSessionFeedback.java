package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "knowledge_session_feedback", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"session_id", "user_id"})
})
public class KnowledgeSessionFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "session_id", nullable = false)
    private KnowledgeSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public KnowledgeSessionFeedback() {}

    public KnowledgeSessionFeedback(KnowledgeSession session, User user, Integer rating, String comment) {
        this.session = session;
        this.user = user;
        this.rating = rating != null ? Math.min(5, Math.max(1, rating)) : 5;
        this.comment = comment;
        this.createdAt = ZonedDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public KnowledgeSession getSession() { return session; }
    public void setSession(KnowledgeSession session) { this.session = session; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating != null ? Math.min(5, Math.max(1, rating)) : 5; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
