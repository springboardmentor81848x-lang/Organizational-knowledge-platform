package com.knowledgeiq.dto;

import java.util.UUID;

public class AssignCourseRequestDto {
    private UUID employeeId;
    private UUID courseId;
    private String notes;

    public AssignCourseRequestDto() {}

    public AssignCourseRequestDto(UUID employeeId, UUID courseId, String notes) {
        this.employeeId = employeeId;
        this.courseId = courseId;
        this.notes = notes;
    }

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
