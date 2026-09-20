package com.okip.dto.training;

public class TrainingResourceResponseDTO {
    private Long resourceId;
    private String title;
    private String resourceType;
    private String resourceUrl;
    private String description;
    private Integer resourceOrder;

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }
    public String getResourceUrl() { return resourceUrl; }
    public void setResourceUrl(String resourceUrl) { this.resourceUrl = resourceUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getResourceOrder() { return resourceOrder; }
    public void setResourceOrder(Integer resourceOrder) { this.resourceOrder = resourceOrder; }
}
