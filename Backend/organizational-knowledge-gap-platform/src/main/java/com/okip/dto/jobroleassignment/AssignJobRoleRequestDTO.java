package com.okip.dto.jobroleassignment;

import com.okip.enums.AssignmentType;

public class AssignJobRoleRequestDTO {

    private Long employeeId;

    private Long jobRoleId;

    private AssignmentType assignmentType;

    public AssignJobRoleRequestDTO() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getJobRoleId() {
        return jobRoleId;
    }

    public void setJobRoleId(Long jobRoleId) {
        this.jobRoleId = jobRoleId;
    }

    public AssignmentType getAssignmentType() {
        return assignmentType;
    }

    public void setAssignmentType(AssignmentType assignmentType) {
        this.assignmentType = assignmentType;
    }

}