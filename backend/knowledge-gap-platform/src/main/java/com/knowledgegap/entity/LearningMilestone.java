package com.knowledgegap.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "learning_milestones")
public class LearningMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // COURSE
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // =========================================================
    // MILESTONE INFORMATION
    // =========================================================

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Integer milestoneOrder;

    // =========================================================
    // PROGRESS
    // =========================================================

    private Integer progressPercentage = 0;

    @Enumerated(EnumType.STRING)
    private TrainingStatus status =
            TrainingStatus.NOT_STARTED;

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getMilestoneOrder() {
        return milestoneOrder;
    }

    public void setMilestoneOrder(Integer milestoneOrder) {
        this.milestoneOrder = milestoneOrder;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(
            Integer progressPercentage) {

        this.progressPercentage =
                progressPercentage;
    }

    public TrainingStatus getStatus() {
        return status;
    }

    public void setStatus(TrainingStatus status) {
        this.status = status;
    }
}