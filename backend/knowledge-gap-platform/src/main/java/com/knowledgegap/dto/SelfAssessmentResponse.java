package com.knowledgegap.dto;

import java.time.LocalDateTime;
import java.util.List;

public class SelfAssessmentResponse {

    private String employeeIdentifier;
    private LocalDateTime assessedAt;
    private List<SelfSkillRatingResponse> ratings;

    public SelfAssessmentResponse() {
    }

    public String getEmployeeIdentifier() {
        return employeeIdentifier;
    }

    public void setEmployeeIdentifier(String employeeIdentifier) {
        this.employeeIdentifier = employeeIdentifier;
    }

    public LocalDateTime getAssessedAt() {
        return assessedAt;
    }

    public void setAssessedAt(LocalDateTime assessedAt) {
        this.assessedAt = assessedAt;
    }

    public List<SelfSkillRatingResponse> getRatings() {
        return ratings;
    }

    public void setRatings(List<SelfSkillRatingResponse> ratings) {
        this.ratings = ratings;
    }

    public static class SelfSkillRatingResponse {

        private String skillName;
        private Integer level;
        private String levelName;

        public SelfSkillRatingResponse() {
        }

        public SelfSkillRatingResponse(
                String skillName,
                Integer level,
                String levelName) {

            this.skillName = skillName;
            this.level = level;
            this.levelName = levelName;
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

        public String getLevelName() {
            return levelName;
        }

        public void setLevelName(String levelName) {
            this.levelName = levelName;
        }
    }
}