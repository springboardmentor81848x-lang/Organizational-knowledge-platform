package com.okip.dto.hr;

import java.util.List;

public class HRDashboardDTO {
    private int totalEmployees;
    private int pendingApprovals;
    private int employeesWithSkillGaps;
    private int criticalSkillGaps;
    private int employeesInTraining;
    private double trainingCompletionRate;
    private double averageLearningProgress;
    private double averageAssessmentScore;
    private double averageSkillImprovement;
    private int activeMentorships;
    private int totalSkills;
    private int totalSkillAssignments;
    private List<DepartmentSummaryDTO> departmentSummaries;
    private List<SkillGapSummaryDTO> topSkillGaps;
    private List<TrainingStatusDTO> trainingStatus;
    private List<AssessmentSummaryDTO> assessmentSummary;
    private List<GrowthPointDTO> employeeGrowth;

    public HRDashboardDTO() {}

    public int getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(int v) { totalEmployees = v; }
    public int getPendingApprovals() { return pendingApprovals; }
    public void setPendingApprovals(int v) { pendingApprovals = v; }
    public int getEmployeesWithSkillGaps() { return employeesWithSkillGaps; }
    public void setEmployeesWithSkillGaps(int v) { employeesWithSkillGaps = v; }
    public int getCriticalSkillGaps() { return criticalSkillGaps; }
    public void setCriticalSkillGaps(int v) { criticalSkillGaps = v; }
    public int getEmployeesInTraining() { return employeesInTraining; }
    public void setEmployeesInTraining(int v) { employeesInTraining = v; }
    public double getTrainingCompletionRate() { return trainingCompletionRate; }
    public void setTrainingCompletionRate(double v) { trainingCompletionRate = v; }
    public double getAverageLearningProgress() { return averageLearningProgress; }
    public void setAverageLearningProgress(double v) { averageLearningProgress = v; }
    public double getAverageAssessmentScore() { return averageAssessmentScore; }
    public void setAverageAssessmentScore(double v) { averageAssessmentScore = v; }
    public double getAverageSkillImprovement() { return averageSkillImprovement; }
    public void setAverageSkillImprovement(double v) { averageSkillImprovement = v; }
    public int getActiveMentorships() { return activeMentorships; }
    public void setActiveMentorships(int v) { activeMentorships = v; }
    public int getTotalSkills() { return totalSkills; }
    public void setTotalSkills(int v) { totalSkills = v; }
    public int getTotalSkillAssignments() { return totalSkillAssignments; }
    public void setTotalSkillAssignments(int v) { totalSkillAssignments = v; }
    public List<DepartmentSummaryDTO> getDepartmentSummaries() { return departmentSummaries; }
    public void setDepartmentSummaries(List<DepartmentSummaryDTO> v) { departmentSummaries = v; }
    public List<SkillGapSummaryDTO> getTopSkillGaps() { return topSkillGaps; }
    public void setTopSkillGaps(List<SkillGapSummaryDTO> v) { topSkillGaps = v; }
    public List<TrainingStatusDTO> getTrainingStatus() { return trainingStatus; }
    public void setTrainingStatus(List<TrainingStatusDTO> v) { trainingStatus = v; }
    public List<AssessmentSummaryDTO> getAssessmentSummary() { return assessmentSummary; }
    public void setAssessmentSummary(List<AssessmentSummaryDTO> v) { assessmentSummary = v; }
    public List<GrowthPointDTO> getEmployeeGrowth() { return employeeGrowth; }
    public void setEmployeeGrowth(List<GrowthPointDTO> v) { employeeGrowth = v; }
}
