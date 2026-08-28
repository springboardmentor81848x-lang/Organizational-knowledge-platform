package com.knowledgegap.dto;

public class ReassessmentSkillResultResponse {

    private String skillName;

    private Integer previousLevel;

    private String previousLevelName;

    private Integer currentLevel;

    private String currentLevelName;

    private Integer improvement;

    private Integer requiredLevel;

    private String requiredLevelName;

    private Integer remainingGap;

    private String gapSeverity;

    private Integer actualScore;

    public ReassessmentSkillResultResponse() {
    }

    public ReassessmentSkillResultResponse(
            String skillName,
            Integer previousLevel,
            String previousLevelName,
            Integer currentLevel,
            String currentLevelName,
            Integer improvement,
            Integer requiredLevel,
            String requiredLevelName,
            Integer remainingGap,
            String gapSeverity,
            Integer actualScore) {

        this.skillName = skillName;
        this.previousLevel = previousLevel;
        this.previousLevelName = previousLevelName;
        this.currentLevel = currentLevel;
        this.currentLevelName = currentLevelName;
        this.improvement = improvement;
        this.requiredLevel = requiredLevel;
        this.requiredLevelName = requiredLevelName;
        this.remainingGap = remainingGap;
        this.gapSeverity = gapSeverity;
        this.actualScore = actualScore;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getPreviousLevel() {
        return previousLevel;
    }

    public void setPreviousLevel(Integer previousLevel) {
        this.previousLevel = previousLevel;
    }

    public String getPreviousLevelName() {
        return previousLevelName;
    }

    public void setPreviousLevelName(String previousLevelName) {
        this.previousLevelName = previousLevelName;
    }

    public Integer getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(Integer currentLevel) {
        this.currentLevel = currentLevel;
    }

    public String getCurrentLevelName() {
        return currentLevelName;
    }

    public void setCurrentLevelName(String currentLevelName) {
        this.currentLevelName = currentLevelName;
    }

    public Integer getImprovement() {
        return improvement;
    }

    public void setImprovement(Integer improvement) {
        this.improvement = improvement;
    }

    public Integer getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(Integer requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public String getRequiredLevelName() {
        return requiredLevelName;
    }

    public void setRequiredLevelName(String requiredLevelName) {
        this.requiredLevelName = requiredLevelName;
    }

    public Integer getRemainingGap() {
        return remainingGap;
    }

    public void setRemainingGap(Integer remainingGap) {
        this.remainingGap = remainingGap;
    }

    public String getGapSeverity() {
        return gapSeverity;
    }

    public void setGapSeverity(String gapSeverity) {
        this.gapSeverity = gapSeverity;
    }

    public Integer getActualScore() {
        return actualScore;
    }

    public void setActualScore(Integer actualScore) {
        this.actualScore = actualScore;
    }
}