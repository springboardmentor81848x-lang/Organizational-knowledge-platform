package com.team7.knowledge_gap_platform.dto;

import java.util.List;

public class AssessmentSubmitRequest {

    private Long employeeId;
    private List<AssessmentAnswerRequest> answers;

    public AssessmentSubmitRequest() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public List<AssessmentAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AssessmentAnswerRequest> answers) {
        this.answers = answers;
    }
}