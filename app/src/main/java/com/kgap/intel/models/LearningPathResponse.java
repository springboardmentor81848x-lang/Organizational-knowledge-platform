package com.kgap.intel.models;

import java.io.Serializable;

public class LearningPathResponse implements Serializable {
    private Long id;
    private Long employeeId;
    private Long skillId;
    private String skillName;
    private String currentLevel;
    private String targetLevel;
    private String courseTitle;
    private String courseLevel;
    private Integer sequenceOrder;
    private Integer estimatedHours;
    private String courseLink;
    private String provider;
    private String status;
    private Integer completionPercentage;
    private String createdAt;

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public Long getSkillId() { return skillId; }
    public String getSkillName() { return skillName; }
    public String getCurrentLevel() { return currentLevel; }
    public String getTargetLevel() { return targetLevel; }
    public String getCourseTitle() { return courseTitle; }
    public String getCourseLevel() { return courseLevel; }
    public Integer getSequenceOrder() { return sequenceOrder; }
    public Integer getEstimatedHours() { return estimatedHours; }
    public String getCourseLink() { return courseLink; }
    public String getProvider() { return provider; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }
    public String getCreatedAt() { return createdAt; }
}
