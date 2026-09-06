package com.kgap.intel.models;

import java.io.Serializable;

public class MentorshipRequest implements Serializable {
    private Long id;
    private Long menteeId;
    private Long mentorId;
    private Long skillId;
    private String learningGoal;
    private String message;
    private String status;
    private String createdAt;
    private String updatedAt;

    // Additional fields for UI display if needed, but backend doesn't provide names in DTO
    // We might need to fetch mentee details separately or update backend to include names
    private String menteeName; 

    public MentorshipRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getMenteeId() { return menteeId; }
    public void setMenteeId(Long menteeId) { this.menteeId = menteeId; }
    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }
    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }
    public String getLearningGoal() { return learningGoal; }
    public void setLearningGoal(String learningGoal) { this.learningGoal = learningGoal; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    public String getMenteeName() { return menteeName; }
    public void setMenteeName(String menteeName) { this.menteeName = menteeName; }
}
