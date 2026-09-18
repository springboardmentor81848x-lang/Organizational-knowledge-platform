package com.knowledgegap.dto;

import java.util.List;

public class PeerAssessmentSubmitRequest {

    private String employeeIdentifier;

    private List<PeerSkillRatingRequest> ratings;

    public PeerAssessmentSubmitRequest() {
    }

    public String getEmployeeIdentifier() {
        return employeeIdentifier;
    }

    public void setEmployeeIdentifier(
            String employeeIdentifier) {

        this.employeeIdentifier = employeeIdentifier;
    }

    public List<PeerSkillRatingRequest> getRatings() {
        return ratings;
    }

    public void setRatings(
            List<PeerSkillRatingRequest> ratings) {

        this.ratings = ratings;
    }
}