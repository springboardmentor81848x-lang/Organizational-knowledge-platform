package com.knowledgegap.dto;

import java.time.LocalDate;

public class LearningVelocityDTO {

    private LocalDate date;

    private Double progress;

    public LearningVelocityDTO() {
    }

    public LearningVelocityDTO(
            LocalDate date,
            Double progress) {

        this.date = date;
        this.progress = progress;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Double getProgress() {
        return progress;
    }

    public void setProgress(Double progress) {
        this.progress = progress;
    }
}