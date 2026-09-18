package com.knowledgegap.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "session_feedback",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"session_id", "employee_id"})
    }
)
public class SessionFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Knowledge session for which feedback is given
    @ManyToOne
    @JoinColumn(name = "session_id", nullable = false)
    private KnowledgeSession session;

    // Employee who gives the feedback
    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Rating given by employee (for example, 1 to 5)
    @Column(nullable = false)
    private Integer rating;

    // Employee comments about the session
    @Column(length = 2000)
    private String comments;

    // Date and time when feedback was submitted
    @Column(nullable = false)
    private LocalDateTime submittedAt;

    public SessionFeedback() {
    }

    public Long getId() {
        return id;
    }

    public KnowledgeSession getSession() {
        return session;
    }

    public void setSession(KnowledgeSession session) {
        this.session = session;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}