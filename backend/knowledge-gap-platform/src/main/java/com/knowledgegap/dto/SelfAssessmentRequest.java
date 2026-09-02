package com.knowledgegap.dto;

import java.util.List;

public class SelfAssessmentRequest {

    private List<SelfSkillRatingRequest> ratings;

    public SelfAssessmentRequest() {
    }

    public List<SelfSkillRatingRequest> getRatings() {
        return ratings;
    }

    public void setRatings(List<SelfSkillRatingRequest> ratings) {
        this.ratings = ratings;
    }

    public static class SelfSkillRatingRequest {

        private String skillName;
        private Integer level;

        public SelfSkillRatingRequest() {
        }

        public String getSkillName() {
            return skillName;
        }

        public void setSkillName(String skillName) {
            this.skillName = skillName;
        }

        public Integer getLevel() {
            return level;
        }

        public void setLevel(Integer level) {
            this.level = level;
        }
    }
}