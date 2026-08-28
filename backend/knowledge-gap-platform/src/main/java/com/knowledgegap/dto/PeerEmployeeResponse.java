package com.knowledgegap.dto;

public class PeerEmployeeResponse {

    private String employeeId;
    private String firstName;
    private String lastName;
    private String designation;
    private Long targetRoleId;

    public PeerEmployeeResponse() {
    }

    public PeerEmployeeResponse(
            String employeeId,
            String firstName,
            String lastName,
            String designation,
            Long targetRoleId) {

        this.employeeId = employeeId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.designation = designation;
        this.targetRoleId = targetRoleId;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public Long getTargetRoleId() {
        return targetRoleId;
    }

    public void setTargetRoleId(Long targetRoleId) {
        this.targetRoleId = targetRoleId;
    }
}