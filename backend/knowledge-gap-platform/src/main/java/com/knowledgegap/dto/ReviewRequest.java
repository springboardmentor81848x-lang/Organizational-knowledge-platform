package com.knowledgegap.dto;

import java.util.List;

import com.knowledgegap.entity.ReviewType;

public class ReviewRequest {

    private Long employeeId;

    private Long reviewerId;

    private ReviewType reviewType;

    private Integer overallRating;

    private String comments;

    private List<ReviewSkillRequest> skillReviews;

    public ReviewRequest() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public ReviewType getReviewType() {
        return reviewType;
    }

    public void setReviewType(ReviewType reviewType) {
        this.reviewType = reviewType;
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Integer overallRating) {
        this.overallRating = overallRating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public List<ReviewSkillRequest> getSkillReviews() {
        return skillReviews;
    }

    public void setSkillReviews(
            List<ReviewSkillRequest> skillReviews) {

        this.skillReviews = skillReviews;
    }
}