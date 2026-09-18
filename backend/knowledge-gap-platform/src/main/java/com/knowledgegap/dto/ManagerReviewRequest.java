package com.knowledgegap.dto;

import java.util.List;

public class ManagerReviewRequest {

private Long managerId;

private Long employeeId;

private Double overallRating;

private String comments;

private List<ReviewRatingRequest> ratings;

public ManagerReviewRequest() {
}

public Long getManagerId() {
    return managerId;
}

public void setManagerId(Long managerId) {
    this.managerId = managerId;
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
