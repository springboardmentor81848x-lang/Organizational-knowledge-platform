package com.knowledgegap.dto;

import java.util.List;

import com.knowledgegap.entity.AssessmentType;

public class AssessmentSubmitRequest {

    private Long assessmentId;

    private List<AssessmentAnswerRequest> answers;

    // =========================================================
    // MODULE 5
    // =========================================================

    private AssessmentType assessmentType;

    /*
     * Required only for PEER and MANAGER assessments.
     *
     * This should contain the evaluator's employee identifier,
     * for example:
     *
     * EMP1002
     *
     * For SELF assessment this can be null.
     */
    private String evaluatorId;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AssessmentSubmitRequest() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public List<AssessmentAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(
            List<AssessmentAnswerRequest> answers) {

        this.answers = answers;
    }

    public AssessmentType getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(
            AssessmentType assessmentType) {

        this.assessmentType = assessmentType;
    }

    public String getEvaluatorId() {
        return evaluatorId;
    }

    public void setEvaluatorId(String evaluatorId) {
        this.evaluatorId = evaluatorId;
    }
}