package com.kgap.intel.models;

public class LearningProgressUpdateRequest {
    private String status;
    private Integer completionPercentage;

    public LearningProgressUpdateRequest() {
    }

    public LearningProgressUpdateRequest(String status, Integer completionPercentage) {
        this.status = status;
        this.completionPercentage = completionPercentage;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }
}
