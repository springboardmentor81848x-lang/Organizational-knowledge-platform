package com.okip.dto.analytics;

public class ProficiencyAnalyticsDTO {

    private String skillName;

    private String currentProficiency;

    private String requiredProficiency;

    // Actual self-assessment percentage
    private Double proficiencyPercentage;

    // Self-assessment score
    private Integer assessmentScore;

    // Total marks of the assessment
    private Integer assessmentTotalMarks;

    public ProficiencyAnalyticsDTO() {
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getCurrentProficiency() {
        return currentProficiency;
    }

    public void setCurrentProficiency(String currentProficiency) {
        this.currentProficiency = currentProficiency;
    }

    public String getRequiredProficiency() {
        return requiredProficiency;
    }

    public void setRequiredProficiency(String requiredProficiency) {
        this.requiredProficiency = requiredProficiency;
    }

    public Double getProficiencyPercentage() {
        return proficiencyPercentage;
    }

    public void setProficiencyPercentage(Double proficiencyPercentage) {
        this.proficiencyPercentage = proficiencyPercentage;
    }

    public Integer getAssessmentScore() {
        return assessmentScore;
    }

    public void setAssessmentScore(Integer assessmentScore) {
        this.assessmentScore = assessmentScore;
    }

    public Integer getAssessmentTotalMarks() {
        return assessmentTotalMarks;
    }

    public void setAssessmentTotalMarks(Integer assessmentTotalMarks) {
        this.assessmentTotalMarks = assessmentTotalMarks;
    }
}