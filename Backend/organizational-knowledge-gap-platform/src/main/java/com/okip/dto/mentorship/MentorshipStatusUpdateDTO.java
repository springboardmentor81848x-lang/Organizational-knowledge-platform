package com.okip.dto.mentorship;

import jakarta.validation.constraints.NotBlank;

public class MentorshipStatusUpdateDTO {
    @NotBlank(message = "Status is required (ACCEPTED, REJECTED, COMPLETED, CANCELLED)")
    private String status;
    private String notes;

    public MentorshipStatusUpdateDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
