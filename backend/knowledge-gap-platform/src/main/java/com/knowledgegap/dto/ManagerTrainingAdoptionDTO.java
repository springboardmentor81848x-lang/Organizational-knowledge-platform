package com.knowledgegap.dto;

public class ManagerTrainingAdoptionDTO {

    private long enrolled;
    private long inProgress;
    private long completed;

    public ManagerTrainingAdoptionDTO() {
    }

    public ManagerTrainingAdoptionDTO(
            long enrolled,
            long inProgress,
            long completed) {

        this.enrolled = enrolled;
        this.inProgress = inProgress;
        this.completed = completed;
    }

    public long getEnrolled() {
        return enrolled;
    }

    public void setEnrolled(long enrolled) {
        this.enrolled = enrolled;
    }

    public long getInProgress() {
        return inProgress;
    }

    public void setInProgress(long inProgress) {
        this.inProgress = inProgress;
    }

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }
}