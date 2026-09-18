package com.knowledgegap.dto;

import java.util.List;

public class ReassessmentRequest {

    private Long assessmentId;

    private String employeeIdentifier;

    private List<ReassessmentAnswerRequest> answers;

    public ReassessmentRequest() {
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getEmployeeIdentifier() {
        return employeeIdentifier;
    }

    public void setEmployeeIdentifier(String employeeIdentifier) {
        this.employeeIdentifier = employeeIdentifier;
    }

    public List<ReassessmentAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<ReassessmentAnswerRequest> answers) {
        this.answers = answers;
    }
}