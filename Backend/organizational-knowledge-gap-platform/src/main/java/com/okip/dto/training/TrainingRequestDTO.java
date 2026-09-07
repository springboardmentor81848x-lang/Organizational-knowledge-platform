package com.okip.dto.training;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TrainingRequestDTO {

    @NotBlank(message = "Training name is required")
    private String trainingName;

    @NotBlank(message = "Provider is required")
    private String provider;

    @NotBlank(message = "Duration is required")
    private String duration;

    @NotBlank(message = "Level is required")
    private String level;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @NotBlank(message = "Course URL is required")
    private String courseUrl;

    public TrainingRequestDTO() {
    }

    public String getTrainingName() {
        return trainingName;
    }

    public void setTrainingName(String trainingName) {
        this.trainingName = trainingName;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCourseUrl() {
        return courseUrl;
    }

    public void setCourseUrl(String courseUrl) {
        this.courseUrl = courseUrl;
    }
}