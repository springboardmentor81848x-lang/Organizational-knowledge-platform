package com.knowledgeiq.dto;

import java.util.UUID;

public class MentorshipRequestDto {
    private UUID mentorId;
    private UUID skillId;
    private String goal;
    private String message;

    public MentorshipRequestDto() {}

    public UUID getMentorId() { return mentorId; }
    public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
