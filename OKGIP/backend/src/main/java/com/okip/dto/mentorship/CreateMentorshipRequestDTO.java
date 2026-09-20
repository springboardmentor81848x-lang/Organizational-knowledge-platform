package com.okip.dto.mentorship;

public class CreateMentorshipRequestDTO {
    private Long mentorId;
    private Long skillId;
    private String message;

    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }
    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
