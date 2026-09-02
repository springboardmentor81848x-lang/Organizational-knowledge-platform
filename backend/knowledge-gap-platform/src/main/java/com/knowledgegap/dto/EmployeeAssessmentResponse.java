package com.knowledgegap.dto;

import java.util.List;

public class EmployeeAssessmentResponse {

    private Long assessmentId;
    private String title;
    private String description;
    private Integer durationMinutes;
    private Long assessmentRoleId;
    private List<AssessmentQuestionResponse> questions;

    public EmployeeAssessmentResponse() {
    }

    public EmployeeAssessmentResponse(
            Long assessmentId,
            String title,
            String description,
            Integer durationMinutes,
            Long assessmentRoleId,
            List<AssessmentQuestionResponse> questions) {

        this.assessmentId = assessmentId;
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.assessmentRoleId = assessmentRoleId;
        this.questions = questions;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public Long getAssessmentRoleId() {
        return assessmentRoleId;
    }

    public List<AssessmentQuestionResponse> getQuestions() {
        return questions;
    }
}