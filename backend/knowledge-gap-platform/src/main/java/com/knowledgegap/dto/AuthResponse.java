package com.knowledgegap.dto;

public class AuthResponse {

    private String token;
    private String role;
    private String firstName;
    private String lastName;
    private String employeeId;
    private String designation;

    // Target role selected by employee
    private Long targetRoleId;

    // Database ID of the employee
    // For a mentor, this value is used as mentorId
    private Long id;

    public AuthResponse(
            String token,
            String role,
            String firstName,
            String lastName,
            String employeeId,
            String designation,
            Long targetRoleId,
            Long id) {

        this.token = token;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.employeeId = employeeId;
        this.designation = designation;
        this.targetRoleId = targetRoleId;
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}