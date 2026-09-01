package com.knowledgegap.dto;

public class ManagerSkillCoverageDTO {

    private String skillName;
    private Double coveragePercentage;

    public ManagerSkillCoverageDTO() {
    }

    public ManagerSkillCoverageDTO(
            String skillName,
            Double coveragePercentage) {

        this.skillName = skillName;
        this.coveragePercentage = coveragePercentage;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Double getCoveragePercentage() {
        return coveragePercentage;
    }

    public void setCoveragePercentage(Double coveragePercentage) {
        this.coveragePercentage = coveragePercentage;
    }
}