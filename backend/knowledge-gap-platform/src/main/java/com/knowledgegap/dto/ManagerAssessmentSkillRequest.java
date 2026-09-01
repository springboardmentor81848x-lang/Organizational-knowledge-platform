package com.knowledgegap.dto;

public class ManagerAssessmentSkillRequest {

    private String skillName;

    private Integer rating;

    public ManagerAssessmentSkillRequest() {
    }

    public ManagerAssessmentSkillRequest(
            String skillName,
            Integer rating) {

        this.skillName = skillName;
        this.rating = rating;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }
}