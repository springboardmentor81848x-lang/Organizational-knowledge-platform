package com.knowledgegap.dto;

import java.util.List;

public class AssessmentResultResponse {

    private Long attemptId;

    private Long assessmentId;

    private String title;

    private Double overallScore;

    private String performanceLevel;

    private Integer correctAnswers;

    private Integer totalQuestions;

    private List<AssessmentSkillResultResponse> skillResults;

    public AssessmentResultResponse() {
    }

    public AssessmentResultResponse(
            Long attemptId,
            Long assessmentId,
            String title,
            Double overallScore,
            String performanceLevel,
            Integer correctAnswers,
            Integer totalQuestions,
            List<AssessmentSkillResultResponse> skillResults) {

        this.attemptId = attemptId;
        this.assessmentId = assessmentId;
        this.title = title;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public List<AssessmentSkillResultResponse> getSkillResults() {
        return skillResults;
    }

    public void setSkillResults(
            List<AssessmentSkillResultResponse> skillResults) {

        this.skillResults = skillResults;
    }
}
