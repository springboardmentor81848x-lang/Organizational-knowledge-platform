package com.knowledgegap.dto;

public class ManagerHighRiskGapDTO {

    private String employeeName;
    private String employeeId;
    private String skillName;
    private Double gapPercentage;
    private String severity;

    public ManagerHighRiskGapDTO() {
    }

    public ManagerHighRiskGapDTO(
            String employeeName,
            String employeeId,
            String skillName,
            Double gapPercentage,
            String severity) {

        this.employeeName = employeeName;
        this.employeeId = employeeId;
        this.skillName = skillName;
        this.gapPercentage = gapPercentage;
        this.severity = severity;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Double getGapPercentage() {
        return gapPercentage;
    }

    public void setGapPercentage(Double gapPercentage) {
        this.gapPercentage = gapPercentage;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}