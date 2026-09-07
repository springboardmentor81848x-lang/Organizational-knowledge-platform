package com.okip.dto.ai;

public class PriorityGapDTO {

    private String skillName;

    private String gapType;

    private Double gapPercentage;

    private String priority;

    public PriorityGapDTO() {
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getGapType() {
        return gapType;
    }

    public void setGapType(String gapType) {
        this.gapType = gapType;
    }

    public Double getGapPercentage() {
        return gapPercentage;
    }

    public void setGapPercentage(Double gapPercentage) {
        this.gapPercentage = gapPercentage;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }
}