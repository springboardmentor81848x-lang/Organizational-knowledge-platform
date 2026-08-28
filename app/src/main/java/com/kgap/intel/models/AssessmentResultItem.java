package com.kgap.intel.models;

import java.io.Serializable;

public class AssessmentResultItem implements Serializable {
    private Long id;
    private Long assessmentId;
    private Long employeeId;
    private Long skillId;
    private String assessmentType;
    private Integer correctAnswers;
    private Integer totalQuestions;
    private Double scorePercentage;
    private String proficiencyLevel;
    private String completedAt;

    public AssessmentResultItem() {
    }

    public AssessmentResultItem(Long id, Long assessmentId, Long employeeId, Long skillId,
                                String assessmentType, Integer correctAnswers, Integer totalQuestions,
                                Double scorePercentage, String proficiencyLevel, String completedAt) {
        this.id = id;
        this.assessmentId = assessmentId;
        this.employeeId = employeeId;
        this.skillId = skillId;
        this.assessmentType = assessmentType;
        this.correctAnswers = correctAnswers;
        this.totalQuestions = totalQuestions;
        this.scorePercentage = scorePercentage;
        this.proficiencyLevel = proficiencyLevel;
        this.completedAt = completedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAssessmentId() { return assessmentId; }
    public void setAssessmentId(Long assessmentId) { this.assessmentId = assessmentId; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getAssessmentType() { return assessmentType; }
    public void setAssessmentType(String assessmentType) { this.assessmentType = assessmentType; }

    public Integer getCorrectAnswers() { return correctAnswers; }
    public void setCorrectAnswers(Integer correctAnswers) { this.correctAnswers = correctAnswers; }

    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }

    public Double getScorePercentage() { return scorePercentage; }
    public void setScorePercentage(Double scorePercentage) { this.scorePercentage = scorePercentage; }

    public String getProficiencyLevel() { return proficiencyLevel; }
    public void setProficiencyLevel(String proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
}
