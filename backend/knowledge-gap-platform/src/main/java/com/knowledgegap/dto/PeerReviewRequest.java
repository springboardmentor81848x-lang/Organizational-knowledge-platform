package com.knowledgegap.dto;

import java.util.List;

public class PeerReviewRequest {

private Long reviewerId;

private Long revieweeId;

private Double overallRating;

private String comments;

private List<ReviewRatingRequest> ratings;

public PeerReviewRequest() {
}

public Long getReviewerId() {
    return reviewerId;
}

public void setReviewerId(Long reviewerId) {
    this.reviewerId = reviewerId;
}

public Long getRevieweeId() {
    return revieweeId;
}

public void setRevieweeId(Long revieweeId) {
    this.revieweeId = revieweeId;
}

public Double getOverallRating() {
    return overallRating;
}

public void setOverallRating(Double overallRating) {
    this.overallRating = overallRating;
}

public String getComments() {
    return comments;
}

public void setComments(String comments) {
    this.comments = comments;
}

public List<ReviewRatingRequest> getRatings() {
    return ratings;
}

public void setRatings(List<ReviewRatingRequest> ratings) {
    this.ratings = ratings;
}
}
