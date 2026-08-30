package com.okip.dto.analytics;

public class HighRiskGapDTO {
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private String department;
    private String jobRole;
    private String skillName;
    private String requiredProficiency;
    private String currentProficiency;
    private String gapType;
    private Double gapPercentage;
    private String riskLevel; // CRITICAL, HIGH, MEDIUM

    public HighRiskGapDTO() {}

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getRequiredProficiency() { return requiredProficiency; }
    public void setRequiredProficiency(String requiredProficiency) { this.requiredProficiency = requiredProficiency; }

    public String getCurrentProficiency() { return currentProficiency; }
    public void setCurrentProficiency(String currentProficiency) { this.currentProficiency = currentProficiency; }

    public String getGapType() { return gapType; }
    public void setGapType(String gapType) { this.gapType = gapType; }

    public Double getGapPercentage() { return gapPercentage; }
    public void setGapPercentage(Double gapPercentage) { this.gapPercentage = gapPercentage; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
}
