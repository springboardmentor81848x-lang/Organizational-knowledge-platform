package com.okip.dto.mentorship;

import java.time.LocalDateTime;

public class MentorshipResponseDTO {
    private Long requestId;
    private Long menteeId;
    private String menteeName;
    private String menteeEmail;
    private String menteeDepartment;
    private Long mentorId;
    private String mentorName;
    private String mentorEmail;
    private String mentorDepartment;
    private Long skillId;
    private String skillName;
    private String topic;
    private String message;
    private String notes;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    private LocalDateTime completedAt;

    public MentorshipResponseDTO() {}

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getMenteeId() { return menteeId; }
    public void setMenteeId(Long menteeId) { this.menteeId = menteeId; }

    public String getMenteeName() { return menteeName; }
    public void setMenteeName(String menteeName) { this.menteeName = menteeName; }

    public String getMenteeEmail() { return menteeEmail; }
    public void setMenteeEmail(String menteeEmail) { this.menteeEmail = menteeEmail; }

    public String getMenteeDepartment() { return menteeDepartment; }
    public void setMenteeDepartment(String menteeDepartment) { this.menteeDepartment = menteeDepartment; }

    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }

    public String getMentorName() { return mentorName; }
    public void setMentorName(String mentorName) { this.mentorName = mentorName; }

    public String getMentorEmail() { return mentorEmail; }
    public void setMentorEmail(String mentorEmail) { this.mentorEmail = mentorEmail; }

    public String getMentorDepartment() { return mentorDepartment; }
    public void setMentorDepartment(String mentorDepartment) { this.mentorDepartment = mentorDepartment; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
