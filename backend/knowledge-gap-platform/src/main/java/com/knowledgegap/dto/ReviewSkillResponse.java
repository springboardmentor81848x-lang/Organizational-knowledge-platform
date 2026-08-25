package com.knowledgegap.dto;

public class ReviewSkillResponse {

    private Long skillId;

    private String skillName;

    private Integer rating;

    private String comments;

    public ReviewSkillResponse() {
    }

    public ReviewSkillResponse(
            Long skillId,
            String skillName,
            Integer rating,
            String comments) {

        this.skillId = skillId;
        this.skillName = skillName;
        this.rating = rating;
        this.comments = comments;
    }

    public Long getSkillId() {
        return skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public Integer getRating() {
        return rating;
    }

    public String getComments() {
        return comments;
    }
}