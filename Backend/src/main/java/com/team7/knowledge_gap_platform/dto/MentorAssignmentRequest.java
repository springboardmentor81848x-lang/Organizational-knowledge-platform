package com.team7.knowledge_gap_platform.dto;

public class MentorAssignmentRequest {

    private Long employeeId;
    private Long mentorId;

    public MentorAssignmentRequest() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getMentorId() {
        return mentorId;
    }

    public void setMentorId(Long mentorId) {
        this.mentorId = mentorId;
    }
}