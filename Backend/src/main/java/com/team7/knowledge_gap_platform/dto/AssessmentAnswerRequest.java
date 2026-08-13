package com.team7.knowledge_gap_platform.dto;

public class AssessmentAnswerRequest {

    private Long questionId;
    private String selectedAnswer;

    public AssessmentAnswerRequest() {
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }
}