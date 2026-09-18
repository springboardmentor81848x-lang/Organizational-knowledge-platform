package com.knowledgegap.dto;

public class ManagerEmployeeProgressDTO {

    private String employeeName;
    private String employeeId;
    private Double progressPercentage;

    public ManagerEmployeeProgressDTO() {
    }

    public ManagerEmployeeProgressDTO(
            String employeeName,
            String employeeId,
            Double progressPercentage) {

        this.employeeName = employeeName;
        this.employeeId = employeeId;
        this.progressPercentage = progressPercentage;
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

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
}