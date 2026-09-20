package com.okip.dto.hr;

public class AssessmentSummaryDTO {
    private String assessmentType;
    private int submittedCount;
    private double averageScore;

    public AssessmentSummaryDTO() {}
    public AssessmentSummaryDTO(String type, int count, double avg) {
        assessmentType = type; submittedCount = count; averageScore = avg;
    }
    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String v) { assessmentType = v; }
    public int getSubmittedCount() { return submittedCount; }
    public void setSubmittedCount(int v) { submittedCount = v; }
    public double getAverageScore() { return averageScore; }
    public void setAverageScore(double v) { averageScore = v; }
}
