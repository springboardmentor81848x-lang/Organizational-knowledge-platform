package com.knowledgeiq.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "learning_milestones")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LearningMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "training_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private TrainingCourse course;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sequence_order", nullable = false)
    private Integer sequenceOrder = 1;

    @Column(name = "completion_percentage", nullable = false)
    private Integer completionPercentage = 25;

    public LearningMilestone() {}

    public LearningMilestone(TrainingCourse course, String title, String description, Integer sequenceOrder, Integer completionPercentage) {
        this.course = course;
        this.title = title;
        this.description = description;
        this.sequenceOrder = sequenceOrder;
        this.completionPercentage = completionPercentage;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public TrainingCourse getCourse() { return course; }
    public void setCourse(TrainingCourse course) { this.course = course; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }

    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }
}
