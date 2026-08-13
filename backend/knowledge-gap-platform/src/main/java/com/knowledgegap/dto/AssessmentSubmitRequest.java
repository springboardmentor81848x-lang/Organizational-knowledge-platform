package com.knowledgegap.dto;

import java.util.List;

public class AssessmentSubmitRequest {

    private Long assessmentId;

    private List<AssessmentAnswerRequest> answers;

    public AssessmentSubmitRequest() {
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public List<AssessmentAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AssessmentAnswerRequest> answers) {
        this.answers = answers;
    }
}