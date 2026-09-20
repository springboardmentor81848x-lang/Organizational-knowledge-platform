package com.okip.entity.master;

import jakarta.persistence.*;

@Entity
@Table(name = "training_modules", uniqueConstraints = @UniqueConstraint(columnNames = {"training_id", "module_order"}))
public class TrainingModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "module_id")
    private Long moduleId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "training_id", nullable = false)
    private Training training;

    @Column(name = "module_title", nullable = false, length = 255)
    private String moduleTitle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "module_order", nullable = false)
    private Integer moduleOrder;

    @Column(name = "estimated_minutes")
    private Integer estimatedMinutes;

    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    public Training getTraining() { return training; }
    public void setTraining(Training training) { this.training = training; }
    public String getModuleTitle() { return moduleTitle; }
    public void setModuleTitle(String moduleTitle) { this.moduleTitle = moduleTitle; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getModuleOrder() { return moduleOrder; }
    public void setModuleOrder(Integer moduleOrder) { this.moduleOrder = moduleOrder; }
    public Integer getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }
}
