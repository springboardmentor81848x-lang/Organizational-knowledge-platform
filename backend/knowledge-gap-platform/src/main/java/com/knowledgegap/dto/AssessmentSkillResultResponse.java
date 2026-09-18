package com.knowledgegap.dto;

public class AssessmentSkillResultResponse {

    private String skillName;

    private Integer actualScore;

    private Integer requiredScore;

    private Integer gap;

    private String gapSeverity;

    public AssessmentSkillResultResponse() {
    }

    public AssessmentSkillResultResponse(
            String skillName,
            Integer actualScore,
            Integer requiredScore,
            Integer gap,
            String gapSeverity) {

        this.skillName = skillName;
        this.actualScore = actualScore;
        this.requiredScore = requiredScore;
        this.gap = gap;
        this.gapSeverity = gapSeverity;
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
}