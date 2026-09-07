package com.okip.dto.jobroleassignment;

import java.time.LocalDate;

import com.okip.enums.AssignmentType;

public class JobRoleAssignmentResponseDTO {

    private Long employeeJobRoleId;

    private String employeeCode;

    private String employeeName;

    private Long jobRoleId;

    private String jobRoleName;

    private AssignmentType assignmentType;

    private String assignedBy;

    private LocalDate assignedDate;

    private Boolean active;

    public JobRoleAssignmentResponseDTO() {
    }

    public Long getEmployeeJobRoleId() {
        return employeeJobRoleId;
    }

    public void setEmployeeJobRoleId(Long employeeJobRoleId) {
        this.employeeJobRoleId = employeeJobRoleId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Long getJobRoleId() {
        return jobRoleId;
    }

    public void setJobRoleId(Long jobRoleId) {
        this.jobRoleId = jobRoleId;
    }

    public String getJobRoleName() {
        return jobRoleName;
    }

    public void setJobRoleName(String jobRoleName) {
        this.jobRoleName = jobRoleName;
    }

    public AssignmentType getAssignmentType() {
        return assignmentType;
    }

    public void setAssignmentType(AssignmentType assignmentType) {
        this.assignmentType = assignmentType;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }

    public LocalDate getAssignedDate() {
        return assignedDate;
    }

    public void setAssignedDate(LocalDate assignedDate) {
        this.assignedDate = assignedDate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

}