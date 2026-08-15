package com.kgap.intel.models;

public class EmployeeProgress {
    private String employeeName;
    private int skillProgress; // Percentage
    private int learningProgress; // Percentage
    private int trainingCompletion; // Count

    public EmployeeProgress(String employeeName, int skillProgress, int learningProgress, int trainingCompletion) {
        this.employeeName = employeeName;
        this.skillProgress = skillProgress;
        this.learningProgress = learningProgress;
        this.trainingCompletion = trainingCompletion;
    }

    public String getEmployeeName() { return employeeName; }
    public int getSkillProgress() { return skillProgress; }
    public int getLearningProgress() { return learningProgress; }
    public int getTrainingCompletion() { return trainingCompletion; }
}
