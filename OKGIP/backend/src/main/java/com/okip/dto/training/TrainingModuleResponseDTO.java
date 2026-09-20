package com.okip.dto.training;

import java.time.LocalDateTime;
import java.util.List;

public class TrainingModuleResponseDTO {
    private Long moduleId;
    private Long trainingId;
    private String moduleTitle;
    private String description;
    private Integer moduleOrder;
    private Integer estimatedMinutes;
    private boolean completed;
    private LocalDateTime completedAt;
    private List<TrainingResourceResponseDTO> resources;

    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    public Long getTrainingId() { return trainingId; }
    public void setTrainingId(Long trainingId) { this.trainingId = trainingId; }
    public String getModuleTitle() { return moduleTitle; }
    public void setModuleTitle(String moduleTitle) { this.moduleTitle = moduleTitle; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getModuleOrder() { return moduleOrder; }
    public void setModuleOrder(Integer moduleOrder) { this.moduleOrder = moduleOrder; }
    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public List<TrainingResourceResponseDTO> getResources() { return resources; }
    public void setResources(List<TrainingResourceResponseDTO> resources) { this.resources = resources; }
}
