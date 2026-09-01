package com.knowledgegap.dto;

import java.util.List;

public class ManagerAssessmentResponse {

    private Long attemptId;

    private Long assessmentId;

    private String assessmentTitle;

    private String employeeIdentifier;

    private String managerIdentifier;

    private double overallScore;

    private String performanceLevel;

    private List<ManagerAssessmentSkillResultResponse> skillResults;

    public ManagerAssessmentResponse() {
    }

    public ManagerAssessmentResponse(
            Long attemptId,
            Long assessmentId,
            String assessmentTitle,
            String employeeIdentifier,
            String managerIdentifier,
            double overallScore,
            String performanceLevel,
            List<ManagerAssessmentSkillResultResponse> skillResults) {

        this.attemptId = attemptId;
        this.assessmentId = assessmentId;
        this.assessmentTitle = assessmentTitle;
        this.employeeIdentifier = employeeIdentifier;
        this.managerIdentifier = managerIdentifier;
        this.overallScore = overallScore;
        this.performanceLevel = performanceLevel;
        this.skillResults = skillResults;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getAssessmentTitle() {
        return assessmentTitle;
    }

    public void setAssessmentTitle(String assessmentTitle) {
        this.assessmentTitle = assessmentTitle;
    }

    public String getEmployeeIdentifier() {
        return employeeIdentifier;
    }

    public void setEmployeeIdentifier(String employeeIdentifier) {
        this.employeeIdentifier = employeeIdentifier;
    }

    public String getManagerIdentifier() {
        return managerIdentifier;
    }

    public void setManagerIdentifier(String managerIdentifier) {
        this.managerIdentifier = managerIdentifier;
    }

    public double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(double overallScore) {
        this.overallScore = overallScore;
    }

    public String getPerformanceLevel() {
        return performanceLevel;
    }

    public void setPerformanceLevel(String performanceLevel) {
        this.performanceLevel = performanceLevel;
    }

    public List<ManagerAssessmentSkillResultResponse> getSkillResults() {
        return skillResults;
    }

    public void setSkillResults(
            List<ManagerAssessmentSkillResultResponse> skillResults) {

        this.skillResults = skillResults;
    }
}
