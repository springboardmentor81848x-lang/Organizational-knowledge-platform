package com.kgap.intel.models;

public class MentorAssignmentRequest {
    private Long employeeId;
    private Long mentorId;

    public MentorAssignmentRequest(Long employeeId, Long mentorId) {
        this.employeeId = employeeId;
        this.mentorId = mentorId;
    }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Long getMentorId() { return mentorId; }
    public void setMentorId(Long mentorId) { this.mentorId = mentorId; }
}
