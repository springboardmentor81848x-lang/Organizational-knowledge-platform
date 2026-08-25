package com.knowledgegap.dto;

import java.util.List;

public class SelfReviewRequest {

private Long employeeId;

private Double overallRating;

private String comments;

private List<ReviewRatingRequest> ratings;

public SelfReviewRequest() {
}

public Long getEmployeeId() {
    return employeeId;
}

public void setEmployeeId(Long employeeId) {
    this.employeeId = employeeId;
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
