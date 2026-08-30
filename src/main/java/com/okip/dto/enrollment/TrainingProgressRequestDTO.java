package com.okip.dto.enrollment;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TrainingProgressRequestDTO {

    @NotNull(message = "Progress is required.")
    @Min(value = 0, message = "Progress cannot be less than 0.")
    @Max(value = 100, message = "Progress cannot exceed 100.")
    private Integer progress;

    public TrainingProgressRequestDTO() {
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }
}