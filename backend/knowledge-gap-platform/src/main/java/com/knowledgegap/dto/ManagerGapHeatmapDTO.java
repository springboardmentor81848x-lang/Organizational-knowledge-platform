package com.knowledgegap.dto;

public class ManagerGapHeatmapDTO {

    private String skillName;
    private Double gapPercentage;
    private String severity;

    public ManagerGapHeatmapDTO() {
    }

    public ManagerGapHeatmapDTO(
            String skillName,
            Double gapPercentage,
            String severity) {

        this.skillName = skillName;
        this.gapPercentage = gapPercentage;
        this.severity = severity;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Double getGapPercentage() {
        return gapPercentage;
    }

    public void setGapPercentage(Double gapPercentage) {
        this.gapPercentage = gapPercentage;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }
}