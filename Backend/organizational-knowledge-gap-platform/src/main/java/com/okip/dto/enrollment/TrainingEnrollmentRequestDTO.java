package com.okip.dto.enrollment;

import jakarta.validation.constraints.NotNull;

public class TrainingEnrollmentRequestDTO {

    @NotNull(message = "Training ID is required.")
    private Long trainingId;

    public TrainingEnrollmentRequestDTO() {
    }

    public Long getTrainingId() {
        return trainingId;
    }

    public void setTrainingId(Long trainingId) {
        this.trainingId = trainingId;
    }
}