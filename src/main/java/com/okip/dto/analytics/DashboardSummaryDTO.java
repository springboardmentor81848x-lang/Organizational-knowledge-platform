package com.okip.dto.analytics;

public class DashboardSummaryDTO {
    private Long employeeId;
    private String employeeName;
    private String jobRole;
    private String department;
    private Double readinessPercentage;
    private Double overallGapPercentage;
    private int totalSkillsRequired;
    private int skillsMastered;
    private int openGaps;
    private int enrolledTrainingsCount;
    private int completedTrainingsCount;
    private int upcomingSessionsCount;
    private int activeMentorshipsCount;
    private int pendingAssessmentsCount;
    private int unreadNotificationsCount;

    public DashboardSummaryDTO() {}

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Double getReadinessPercentage() { return readinessPercentage; }
    public void setReadinessPercentage(Double readinessPercentage) { this.readinessPercentage = readinessPercentage; }

    public Double getOverallGapPercentage() { return overallGapPercentage; }
    public void setOverallGapPercentage(Double overallGapPercentage) { this.overallGapPercentage = overallGapPercentage; }

    public int getTotalSkillsRequired() { return totalSkillsRequired; }
    public void setTotalSkillsRequired(int totalSkillsRequired) { this.totalSkillsRequired = totalSkillsRequired; }

    public int getSkillsMastered() { return skillsMastered; }
    public void setSkillsMastered(int skillsMastered) { this.skillsMastered = skillsMastered; }

    public int getOpenGaps() { return openGaps; }
    public void setOpenGaps(int openGaps) { this.openGaps = openGaps; }

    public int getEnrolledTrainingsCount() { return enrolledTrainingsCount; }
    public void setEnrolledTrainingsCount(int enrolledTrainingsCount) { this.enrolledTrainingsCount = enrolledTrainingsCount; }

    public int getCompletedTrainingsCount() { return completedTrainingsCount; }
    public void setCompletedTrainingsCount(int completedTrainingsCount) { this.completedTrainingsCount = completedTrainingsCount; }

    public int getUpcomingSessionsCount() { return upcomingSessionsCount; }
    public void setUpcomingSessionsCount(int upcomingSessionsCount) { this.upcomingSessionsCount = upcomingSessionsCount; }

    public int getActiveMentorshipsCount() { return activeMentorshipsCount; }
    public void setActiveMentorshipsCount(int activeMentorshipsCount) { this.activeMentorshipsCount = activeMentorshipsCount; }

    public int getPendingAssessmentsCount() { return pendingAssessmentsCount; }
    public void setPendingAssessmentsCount(int pendingAssessmentsCount) { this.pendingAssessmentsCount = pendingAssessmentsCount; }

    public int getUnreadNotificationsCount() { return unreadNotificationsCount; }
    public void setUnreadNotificationsCount(int unreadNotificationsCount) { this.unreadNotificationsCount = unreadNotificationsCount; }
}
