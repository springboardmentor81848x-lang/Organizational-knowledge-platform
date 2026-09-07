package com.okip.dto.mentorship;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class MentorshipRequestDTO {
    @NotNull(message = "Mentor ID is required")
    private Long mentorId;

    private Long skillId;
    private String topic;

    @NotBlank(message = "Message is required")
    private String message;

    public MentorshipRequestDTO() {}

    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
