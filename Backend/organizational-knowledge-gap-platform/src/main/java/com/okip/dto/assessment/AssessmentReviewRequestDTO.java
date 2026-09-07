package com.okip.dto.assessment;

import jakarta.validation.constraints.NotBlank;

public class AssessmentReviewRequestDTO {
    @NotBlank(message = "Status is required (APPROVED or REJECTED)")
    private String status;

    private String reviewerComments;
    private String overrideProficiency; // optional: manager can adjust proficiency level upon approval

    public AssessmentReviewRequestDTO() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewerComments() { return reviewerComments; }
    public void setReviewerComments(String reviewerComments) { this.reviewerComments = reviewerComments; }

    public String getOverrideProficiency() { return overrideProficiency; }
    public void setOverrideProficiency(String overrideProficiency) { this.overrideProficiency = overrideProficiency; }
}
