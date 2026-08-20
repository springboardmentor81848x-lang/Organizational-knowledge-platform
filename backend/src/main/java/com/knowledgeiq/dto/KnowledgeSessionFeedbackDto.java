package com.knowledgeiq.dto;

import java.util.UUID;

public class KnowledgeSessionFeedbackDto {
    private UUID sessionId;
    private Integer rating;
    private String comment;

    public KnowledgeSessionFeedbackDto() {}

    public UUID getSessionId() { return sessionId; }
    public void setSessionId(UUID sessionId) { this.sessionId = sessionId; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
