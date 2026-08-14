package com.knowledgeiq.dto;

import java.util.UUID;

public class PersonalizedRecommendationDto {
    private UUID courseId;
    private String title;
    private String category;
    private String provider;
    private Integer durationHours;
    private Integer currentLevel;
    private Integer requiredLevel;
    private Integer gapPercentage;
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED
    private String whyRecommended;
    private String courseUrl;
    
    // Enhanced Learning Path Fields
    private Integer stepNumber;
    private Boolean isStartHere;
    private String prerequisiteCourseTitle;
    private Double recommendationScore;
    private Boolean isExternal;

    public PersonalizedRecommendationDto() {}

    public PersonalizedRecommendationDto(UUID courseId, String title, String category, String provider, Integer durationHours, Integer currentLevel, Integer requiredLevel, Integer gapPercentage, String priority, String status, String whyRecommended, String courseUrl, Integer stepNumber, Boolean isStartHere, String prerequisiteCourseTitle, Double recommendationScore, Boolean isExternal) {
        this.courseId = courseId;
        this.title = title;
        this.category = category;
        this.provider = provider;
        this.durationHours = durationHours;
        this.currentLevel = currentLevel;
        this.requiredLevel = requiredLevel;
        this.gapPercentage = gapPercentage;
        this.priority = priority;
        this.status = status;
        this.whyRecommended = whyRecommended;
        this.courseUrl = courseUrl;
        this.stepNumber = stepNumber;
        this.isStartHere = isStartHere;
        this.prerequisiteCourseTitle = prerequisiteCourseTitle;
        this.recommendationScore = recommendationScore;
        this.isExternal = isExternal;
    }

    public UUID getCourseId() { return courseId; }
    public void setCourseId(UUID courseId) { this.courseId = courseId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public Integer getDurationHours() { return durationHours; }
    public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }

    public Integer getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(Integer currentLevel) { this.currentLevel = currentLevel; }

    public Integer getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }

    public Integer getGapPercentage() { return gapPercentage; }
    public void setGapPercentage(Integer gapPercentage) { this.gapPercentage = gapPercentage; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getWhyRecommended() { return whyRecommended; }
    public void setWhyRecommended(String whyRecommended) { this.whyRecommended = whyRecommended; }

    public String getCourseUrl() { return courseUrl; }
    public void setCourseUrl(String courseUrl) { this.courseUrl = courseUrl; }

    public Integer getStepNumber() { return stepNumber; }
    public void setStepNumber(Integer stepNumber) { this.stepNumber = stepNumber; }

    public Boolean getIsStartHere() { return isStartHere; }
    public void setIsStartHere(Boolean isStartHere) { this.isStartHere = isStartHere; }

    public String getPrerequisiteCourseTitle() { return prerequisiteCourseTitle; }
    public void setPrerequisiteCourseTitle(String prerequisiteCourseTitle) { this.prerequisiteCourseTitle = prerequisiteCourseTitle; }

    public Double getRecommendationScore() { return recommendationScore; }
    public void setRecommendationScore(Double recommendationScore) { this.recommendationScore = recommendationScore; }

    public Boolean getIsExternal() { return isExternal; }
    public void setIsExternal(Boolean isExternal) { this.isExternal = isExternal; }
}
