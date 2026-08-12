package com.team7.knowledge_gap_platform.dto;

public class HeatmapResponse {

    private Long employeeId;
    private Long skillId;
    private Integer gapScore;
    private String gapLevel;
    private String color;

    public HeatmapResponse() {
    }

    public HeatmapResponse(
            Long employeeId,
            Long skillId,
            Integer gapScore,
            String gapLevel,
            String color) {

        this.employeeId = employeeId;
        this.skillId = skillId;
        this.gapScore = gapScore;
        this.gapLevel = gapLevel;
        this.color = color;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public Integer getGapScore() {
        return gapScore;
    }

    public void setGapScore(Integer gapScore) {
        this.gapScore = gapScore;
    }

    public String getGapLevel() {
        return gapLevel;
    }

    public void setGapLevel(String gapLevel) {
        this.gapLevel = gapLevel;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }
}