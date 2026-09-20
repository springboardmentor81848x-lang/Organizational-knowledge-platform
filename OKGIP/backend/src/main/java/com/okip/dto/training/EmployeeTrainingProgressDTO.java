package com.okip.dto.training;

public class EmployeeTrainingProgressDTO {
    private Long employeeTrainingId;
    private Long trainingId;
    private String trainingName;
    private String provider;
    private String duration;
    private String courseUrl;
    private String status;
    private double progressPercentage;
    private double hoursSpent;
    private String enrolledAt;
    private String startedAt;
    private String lastActivityAt;
    private String completedAt;

    public Long getEmployeeTrainingId() { return employeeTrainingId; }
    public void setEmployeeTrainingId(Long v) { employeeTrainingId = v; }
    public Long getTrainingId() { return trainingId; }
    public void setTrainingId(Long v) { trainingId = v; }
    public String getTrainingName() { return trainingName; }
    public void setTrainingName(String v) { trainingName = v; }
    public String getProvider() { return provider; }
    public void setProvider(String v) { provider = v; }
    public String getDuration() { return duration; }
    public void setDuration(String v) { duration = v; }
    public String getCourseUrl() { return courseUrl; }
    public void setCourseUrl(String v) { courseUrl = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { status = v; }
    public double getProgressPercentage() { return progressPercentage; }
    public void setProgressPercentage(double v) { progressPercentage = v; }
    public double getHoursSpent() { return hoursSpent; }
    public void setHoursSpent(double v) { hoursSpent = v; }
    public String getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(String v) { enrolledAt = v; }
    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String v) { startedAt = v; }
    public String getLastActivityAt() { return lastActivityAt; }
    public void setLastActivityAt(String v) { lastActivityAt = v; }
    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String v) { completedAt = v; }
}
