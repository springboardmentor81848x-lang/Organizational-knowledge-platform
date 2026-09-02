package com.knowledgegap.dto;

public class SkillAssessmentResult {

    private String skillName;

    private Integer totalQuestions;

    private Integer correctAnswers;

    private Double percentage;

    private String proficiencyLevel;

    public SkillAssessmentResult() {
    }

    public SkillAssessmentResult(
            String skillName,
            Integer totalQuestions,
            Integer correctAnswers,
            Double percentage,
            String proficiencyLevel) {

        this.skillName = skillName;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.percentage = percentage;
        this.proficiencyLevel = proficiencyLevel;
    }

    public String getSkillName() {
        return skillName;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public Double getPercentage() {
        return percentage;
    }

    public String getProficiencyLevel() {
        return proficiencyLevel;
    }
}