package com.knowledgeiq.dto;

import java.util.UUID;

public class PeerRequestDto {
    private UUID evaluatorId;
    private String evaluatorEmail;
    private String title;
    private String notes;

    public PeerRequestDto() {}

    public UUID getEvaluatorId() { return evaluatorId; }
    public void setEvaluatorId(UUID evaluatorId) { this.evaluatorId = evaluatorId; }

    public String getEvaluatorEmail() { return evaluatorEmail; }
    public void setEvaluatorEmail(String evaluatorEmail) { this.evaluatorEmail = evaluatorEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
