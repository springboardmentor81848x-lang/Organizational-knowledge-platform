package com.knowledgegap.dto;

public class AuthResponse {

    private String token;
    private String role;
    private String firstName;
    private String lastName;
    private String employeeId;

    public AuthResponse(String token, String role, String firstName, String lastName, String employeeId) {
        this.token = token;
        this.role = role;
        this.firstName = firstName;
        this.lastName = lastName;
        this.employeeId = employeeId;
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
}