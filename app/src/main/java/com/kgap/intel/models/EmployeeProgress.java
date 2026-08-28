package com.kgap.intel.models;

public class EmployeeProgress {
    private String employeeName;
    private int skillProgress; // Percentage
    private int learningProgress; // Percentage
    private int trainingCompletion; // Count
    private Long employeeId;
    private String role;
    private String department;
    private int activeGapsCount;

    public EmployeeProgress(String employeeName, int skillProgress, int learningProgress, int trainingCompletion) {
        this.employeeName = employeeName;
        this.skillProgress = skillProgress;
        this.learningProgress = learningProgress;
        this.trainingCompletion = trainingCompletion;
    }

    public EmployeeProgress(Long employeeId, String employeeName, String role, String department, int skillProgress, int learningProgress, int trainingCompletion, int activeGapsCount) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.role = role;
        this.department = department;
        this.skillProgress = skillProgress;
        this.learningProgress = learningProgress;
        this.trainingCompletion = trainingCompletion;
        this.activeGapsCount = activeGapsCount;
    }

    public String getEmployeeName() { return employeeName; }
    public int getSkillProgress() { return skillProgress; }
    public int getLearningProgress() { return learningProgress; }
    public int getTrainingCompletion() { return trainingCompletion; }
    public Long getEmployeeId() { return employeeId; }
    public String getRole() { return role; }
    public String getDepartment() { return department; }
    public int getActiveGapsCount() { return activeGapsCount; }
}
