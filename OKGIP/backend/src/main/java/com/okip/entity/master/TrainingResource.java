package com.okip.entity.master;

import jakarta.persistence.*;

@Entity
@Table(name = "training_resources", uniqueConstraints = @UniqueConstraint(columnNames = {"module_id", "resource_order"}))
public class TrainingResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "module_id", nullable = false)
    private TrainingModule module;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false, length = 30)
    private ResourceType resourceType;

    @Column(name = "resource_url", nullable = false, length = 1500)
    private String resourceUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "resource_order", nullable = false)
    private Integer resourceOrder;

    public enum ResourceType { VIDEO, PDF, ARTICLE, PRACTICE, LINK }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }
    public TrainingModule getModule() { return module; }
    public void setModule(TrainingModule module) { this.module = module; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public ResourceType getResourceType() { return resourceType; }
    public void setResourceType(ResourceType resourceType) { this.resourceType = resourceType; }
    public String getResourceUrl() { return resourceUrl; }
    public void setResourceUrl(String resourceUrl) { this.resourceUrl = resourceUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getResourceOrder() { return resourceOrder; }
    public void setResourceOrder(Integer resourceOrder) { this.resourceOrder = resourceOrder; }
}
