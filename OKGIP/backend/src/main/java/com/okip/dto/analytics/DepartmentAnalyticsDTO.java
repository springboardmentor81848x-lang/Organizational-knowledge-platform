package com.okip.dto.analytics;

public class DepartmentAnalyticsDTO {

    private String departmentName;

    private Integer employeeCount;

    private Double averageGapPercentage;

    private Double averageReadinessPercentage;

    public DepartmentAnalyticsDTO() {
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Integer getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(Integer employeeCount) {
        this.employeeCount = employeeCount;
    }

    public Double getAverageGapPercentage() {
        return averageGapPercentage;
    }

    public void setAverageGapPercentage(
            Double averageGapPercentage) {

        this.averageGapPercentage = averageGapPercentage;
    }

    public Double getAverageReadinessPercentage() {
        return averageReadinessPercentage;
    }

    public void setAverageReadinessPercentage(
            Double averageReadinessPercentage) {

        this.averageReadinessPercentage =
                averageReadinessPercentage;
    }
}