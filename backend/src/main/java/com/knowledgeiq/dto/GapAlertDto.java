package com.knowledgeiq.dto;

public class GapAlertDto {
    private String title;
    private String sev; // Critical, High, Medium, Low
    private String dept;
    private String skill;
    private String recommendation;

    public GapAlertDto() {}

    public GapAlertDto(String title, String sev, String dept, String skill, String recommendation) {
        this.title = title;
        this.sev = sev;
        this.dept = dept;
        this.skill = skill;
        this.recommendation = recommendation;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSev() { return sev; }
    public void setSev(String sev) { this.sev = sev; }

    public String getDept() { return dept; }
    public void setDept(String dept) { this.dept = dept; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
}
