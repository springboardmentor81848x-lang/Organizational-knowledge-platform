package com.knowledgegap.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PeerReviewResponse {

    private Long attemptId;

    private String reviewerName;

    private String reviewerIdentifier;

    private LocalDateTime completedAt;

    private Double overallScore;

    private String performanceLevel;

    private List<PeerSkillReviewResponse> skillRatings;

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public String getReviewerIdentifier() {
        return reviewerIdentifier;
    }

    public void setReviewerIdentifier(String reviewerIdentifier) {
        this.reviewerIdentifier = reviewerIdentifier;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public String getPerformanceLevel() {
        return performanceLevel;
    }

    public void setPerformanceLevel(String performanceLevel) {
        this.performanceLevel = performanceLevel;
    }

    public List<PeerSkillReviewResponse> getSkillRatings() {
        return skillRatings;
    }

    public void setSkillRatings(List<PeerSkillReviewResponse> skillRatings) {
        this.skillRatings = skillRatings;
    }
}