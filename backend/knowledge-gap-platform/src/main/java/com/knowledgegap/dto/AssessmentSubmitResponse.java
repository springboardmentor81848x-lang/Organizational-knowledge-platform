package com.knowledgegap.dto;

import java.util.Map;

public class AssessmentSubmitResponse {

    private Long employeeId;

    private Long assessmentId;

    private Integer totalQuestions;

    private Integer correctAnswers;

    private Integer totalMarks;

    private Integer obtainedMarks;

    private Double overallPercentage;

    private String overallLevel;

    private Map<String, SkillAssessmentResult> skillResults;

    public AssessmentSubmitResponse() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Integer getObtainedMarks() {
        return obtainedMarks;
    }

    public void setObtainedMarks(Integer obtainedMarks) {
        this.obtainedMarks = obtainedMarks;
    }

    public Double getOverallPercentage() {
        return overallPercentage;
    }

    public void setOverallPercentage(Double overallPercentage) {
        this.overallPercentage = overallPercentage;
    }

    public String getOverallLevel() {
        return overallLevel;
    }

    public void setOverallLevel(String overallLevel) {
        this.overallLevel = overallLevel;
    }

    public Map<String, SkillAssessmentResult> getSkillResults() {
        return skillResults;
    }

    public void setSkillResults(
            Map<String, SkillAssessmentResult> skillResults) {

        this.skillResults = skillResults;
    }
}