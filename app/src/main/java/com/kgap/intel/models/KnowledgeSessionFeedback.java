package com.kgap.intel.models;

import java.io.Serializable;

public class KnowledgeSessionFeedback implements Serializable {
    private Long id;
    private Long sessionId;
    private Long employeeId;
    private Integer rating;
    private String feedback;
    private String createdAt;

    public KnowledgeSessionFeedback() {}

    public KnowledgeSessionFeedback(Long sessionId, Long employeeId, Integer rating, String feedback) {
        this.sessionId = sessionId;
        this.employeeId = employeeId;
        this.rating = rating;
        this.feedback = feedback;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
