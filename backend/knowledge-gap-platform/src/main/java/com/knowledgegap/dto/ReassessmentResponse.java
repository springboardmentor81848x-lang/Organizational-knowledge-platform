package com.knowledgegap.dto;

import java.util.List;

public class ReassessmentResponse {

    private Long attemptId;

    private Long assessmentId;

    private String assessmentTitle;

    private String employeeIdentifier;

    private Double overallScore;

    private String performanceLevel;

    private Integer correctAnswers;

    private Integer totalQuestions;

    private List<ReassessmentSkillResultResponse> skillResults;

    public ReassessmentResponse() {
    }

    public ReassessmentResponse(
            Long attemptId,
            Long assessmentId,
            String assessmentTitle,
            String employeeIdentifier,
            Double overallScore,
            String performanceLevel,
            Integer correctAnswers,
            Integer totalQuestions,
            List<ReassessmentSkillResultResponse> skillResults) {

        this.attemptId = attemptId;
        this.assessmentId = assessmentId;
        this.assessmentTitle = assessmentTitle;
        this.employeeIdentifier = employeeIdentifier;
        this.overallScore = overallScore;
        this.performanceLevel = performanceLevel;
        this.correctAnswers = correctAnswers;
        this.totalQuestions = totalQuestions;
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

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public String getPerformanceLevel() {
        return performanceLevel;
    }

    public void setPerformanceLevel(String performanceLevel) {
        this.performanceLevel = performanceLevel;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public List<ReassessmentSkillResultResponse> getSkillResults() {
        return skillResults;
    }

    public void setSkillResults(
            List<ReassessmentSkillResultResponse> skillResults) {

        this.skillResults = skillResults;
    }
}