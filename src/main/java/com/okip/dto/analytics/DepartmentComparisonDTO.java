package com.okip.dto.analytics;

public class DepartmentComparisonDTO {
    private Long departmentId;
    private String departmentName;
    private long employeeCount;
    private double averageReadinessPercentage;
    private double averageGapScore;
    private long openGapsCount;
    private long completedTrainingsCount;
    private long activeEnrollmentsCount;

    public DepartmentComparisonDTO() {}

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public long getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(long employeeCount) { this.employeeCount = employeeCount; }

    public double getAverageReadinessPercentage() { return averageReadinessPercentage; }
    public void setAverageReadinessPercentage(double averageReadinessPercentage) { this.averageReadinessPercentage = averageReadinessPercentage; }

    public double getAverageGapScore() { return averageGapScore; }
    public void setAverageGapScore(double averageGapScore) { this.averageGapScore = averageGapScore; }

    public long getOpenGapsCount() { return openGapsCount; }
    public void setOpenGapsCount(long openGapsCount) { this.openGapsCount = openGapsCount; }

    public long getCompletedTrainingsCount() { return completedTrainingsCount; }
    public void setCompletedTrainingsCount(long completedTrainingsCount) { this.completedTrainingsCount = completedTrainingsCount; }

    public long getActiveEnrollmentsCount() { return activeEnrollmentsCount; }
    public void setActiveEnrollmentsCount(long activeEnrollmentsCount) { this.activeEnrollmentsCount = activeEnrollmentsCount; }
}
