package com.knowledgegap.dto;

public class PeerSkillReviewResponse {

    private String skillName;

    private Integer rating;

    private String ratingLevel;

    public PeerSkillReviewResponse() {
    }

    public PeerSkillReviewResponse(
            String skillName,
            Integer rating,
            String ratingLevel) {

        this.skillName = skillName;
        this.rating = rating;
        this.ratingLevel = ratingLevel;
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

    public String getRatingLevel() {
        return ratingLevel;
    }

    public void setRatingLevel(String ratingLevel) {
        this.ratingLevel = ratingLevel;
    }
}