
package com.knowledgegap.dto;

import java.util.List;

import com.knowledgegap.entity.AssessmentType;

public class AssessmentSubmitRequest {

    private Long employeeId;

    private Long assessmentId;

    private List<AssessmentAnswerRequest> answers;

    // =========================================================
    // MODULE 5
    // =========================================================

    private AssessmentType assessmentType;

    /*
     * Required only for PEER and MANAGER assessments.
     *
     * Example:
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
    // EMPLOYEE ID
    // =========================================================

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    // =========================================================
    // ASSESSMENT ID
    // =========================================================

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    // =========================================================
    // ANSWERS
    // =========================================================

    public List<AssessmentAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AssessmentAnswerRequest> answers) {
        this.answers = answers;
    }

    // =========================================================
    // ASSESSMENT TYPE
    // =========================================================

    public AssessmentType getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(AssessmentType assessmentType) {
        this.assessmentType = assessmentType;
    }

    // =========================================================
    // EVALUATOR ID
    // =========================================================

    public String getEvaluatorId() {
        return evaluatorId;
    }

    public void setEvaluatorId(String evaluatorId) {
        this.evaluatorId = evaluatorId;
    }
}