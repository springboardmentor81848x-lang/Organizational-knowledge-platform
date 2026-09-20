package com.okip.dto.hr;

public class DepartmentSummaryDTO {
    private String departmentName;
    private int employeeCount;
    private double averageProficiency;
    private double averageGapPercentage;

    public DepartmentSummaryDTO() {}
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String v) { departmentName = v; }
    public int getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(int v) { employeeCount = v; }
    public double getAverageProficiency() { return averageProficiency; }
    public void setAverageProficiency(double v) { averageProficiency = v; }
    public double getAverageGapPercentage() { return averageGapPercentage; }
    public void setAverageGapPercentage(double v) { averageGapPercentage = v; }
}
