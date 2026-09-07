package com.knowledgegap.dto;

public class AssessmentGapResultResponse {

    private Long id;
    private String skillName;
    private Integer actualScore;
    private Integer requiredScore;
    private Integer gap;
    private String gapSeverity;
    private Integer previousLevel;
    private Integer assessedLevel;
    private Integer improvement;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public AssessmentGapResultResponse() {
    }

    // =========================================================
    // FULL CONSTRUCTOR
    // =========================================================

    public AssessmentGapResultResponse(
            Long id,
            String skillName,
            Integer actualScore,
            Integer requiredScore,
            Integer gap,
            String gapSeverity,
            Integer previousLevel,
            Integer assessedLevel,
            Integer improvement) {

        this.id = id;
        this.skillName = skillName;
        this.actualScore = actualScore;
        this.requiredScore = requiredScore;
        this.gap = gap;
        this.gapSeverity = gapSeverity;
        this.previousLevel = previousLevel;
        this.assessedLevel = assessedLevel;
        this.improvement = improvement;
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getActualScore() {
        return actualScore;
    }

    public void setActualScore(Integer actualScore) {
        this.actualScore = actualScore;
    }

    public Integer getRequiredScore() {
        return requiredScore;
    }

    public void setRequiredScore(Integer requiredScore) {
        this.requiredScore = requiredScore;
    }

    public Integer getGap() {
        return gap;
    }

    public void setGap(Integer gap) {
        this.gap = gap;
    }

    public String getGapSeverity() {
        return gapSeverity;
    }

    public void setGapSeverity(String gapSeverity) {
        this.gapSeverity = gapSeverity;
    }

    public Integer getPreviousLevel() {
        return previousLevel;
    }

    public void setPreviousLevel(Integer previousLevel) {
        this.previousLevel = previousLevel;
    }

    public Integer getAssessedLevel() {
        return assessedLevel;
    }

    public void setAssessedLevel(Integer assessedLevel) {
        this.assessedLevel = assessedLevel;
    }

    public Integer getImprovement() {
        return improvement;
    }

    public void setImprovement(Integer improvement) {
        this.improvement = improvement;
    }
}