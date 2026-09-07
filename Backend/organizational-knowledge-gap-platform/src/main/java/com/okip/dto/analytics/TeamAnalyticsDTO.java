package com.okip.dto.analytics;

public class TeamAnalyticsDTO {

    private Long employeeId;

    private String employeeCode;

    private String employeeName;

    private String jobRoleName;

    private Double gapPercentage;

    private Double readinessPercentage;

    public TeamAnalyticsDTO() {
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

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getJobRoleName() {
        return jobRoleName;
    }

    public void setJobRoleName(String jobRoleName) {
        this.jobRoleName = jobRoleName;
    }

    public Double getGapPercentage() {
        return gapPercentage;
    }

    public void setGapPercentage(Double gapPercentage) {
        this.gapPercentage = gapPercentage;
    }

    public Double getReadinessPercentage() {
        return readinessPercentage;
    }

    public void setReadinessPercentage(Double readinessPercentage) {
        this.readinessPercentage = readinessPercentage;
    }
}