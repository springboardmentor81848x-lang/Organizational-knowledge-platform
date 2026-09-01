package com.knowledgegap.dto;

public class ManagerAssessmentSkillResultResponse {

    // =========================================================
    // FIELDS
    // =========================================================

    private String skillName;

    // Manager's numeric rating
    // 1 = Beginner
    // 2 = Intermediate
    // 3 = Competent
    // 4 = Advanced
    // 5 = Expert
    private Integer rating;

    // Manager's selected level name
    // Beginner / Intermediate / Competent / Advanced / Expert
    private String level;

    private int previousLevel;

    private int improvement;

    private int requiredScore;

    private int actualScore;

    private int gap;

    private String gapSeverity;

    // =========================================================
    // DEFAULT CONSTRUCTOR
    // =========================================================

    public ManagerAssessmentSkillResultResponse() {
    }

    // =========================================================
    // FULL CONSTRUCTOR
    // =========================================================

    public ManagerAssessmentSkillResultResponse(
            String skillName,
            Integer rating,
            String level,
            int previousLevel,
            int improvement,
            int requiredScore,
            int actualScore,
            int gap,
            String gapSeverity) {

        this.skillName = skillName;
        this.rating = rating;
        this.level = level;
        this.previousLevel = previousLevel;
        this.improvement = improvement;
        this.requiredScore = requiredScore;
        this.actualScore = actualScore;
        this.gap = gap;
        this.gapSeverity = gapSeverity;
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public String getSkillName() {
        return skillName;
    }

    public Integer getRating() {
        return rating;
    }

    public String getLevel() {
        return level;
    }

    public int getPreviousLevel() {
        return previousLevel;
    }

    public int getImprovement() {
        return improvement;
    }

    public int getRequiredScore() {
        return requiredScore;
    }

    public int getActualScore() {
        return actualScore;
    }

    public int getGap() {
        return gap;
    }

    public String getGapSeverity() {
        return gapSeverity;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public void setPreviousLevel(int previousLevel) {
        this.previousLevel = previousLevel;
    }

    public void setImprovement(int improvement) {
        this.improvement = improvement;
    }

    public void setRequiredScore(int requiredScore) {
        this.requiredScore = requiredScore;
    }

    public void setActualScore(int actualScore) {
        this.actualScore = actualScore;
    }

    public void setGap(int gap) {
        this.gap = gap;
    }

    public void setGapSeverity(String gapSeverity) {
        this.gapSeverity = gapSeverity;
    }
}