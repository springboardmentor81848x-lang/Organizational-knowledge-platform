package com.okip.dto.peerassessment;

public class PeerDTO {

    private Long employeeId;
    private String employeeCode;
    private String name;
    private String email;
    private String department;
    private String role;

    public PeerDTO() {
    }

    public PeerDTO(
            Long employeeId,
            String employeeCode,
            String name,
            String email,
            String department,
            String role
    ) {
        this.employeeId = employeeId;
        this.employeeCode = employeeCode;
        this.name = name;
        this.email = email;
        this.department = department;
        this.role = role;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}