package com.knowledgegap.dto;

import java.util.Map;

public class AssessmentSubmitRequest {

    private Long employeeId;

    private Long assessmentId;

    /*
     * questionId -> employee's selected answer
     *
     * Example:
     *
     * 1 -> "B"
     * 2 -> "C"
     * 3 -> "C"
     */
    private Map<Long, String> answers;

    public AssessmentSubmitRequest() {
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

    public Map<Long, String> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, String> answers) {
        this.answers = answers;
    }
}