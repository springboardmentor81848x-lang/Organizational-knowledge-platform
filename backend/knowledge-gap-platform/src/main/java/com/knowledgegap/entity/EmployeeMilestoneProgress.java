package com.knowledgegap.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(
    name = "employee_milestone_progress",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"employee_id", "milestone_id"}
        )
    }
)
public class EmployeeMilestoneProgress {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // EMPLOYEE
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // =========================================================
    // MILESTONE
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "milestone_id", nullable = false)
    private LearningMilestone milestone;

    // =========================================================
    // PROGRESS
    // =========================================================

    @Column(nullable = false)
    private Integer progressPercentage = 0;

    // =========================================================
    // STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainingStatus status = TrainingStatus.NOT_STARTED;

    // =========================================================
    // DATES
    // =========================================================

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    // =========================================================
    // CREATED / UPDATED
    // =========================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (progressPercentage == null) {
            progressPercentage = 0;
        }

        if (status == null) {
            status = TrainingStatus.NOT_STARTED;
        }

        updateDates();
    }

    // =========================================================
    // PRE UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();

        if (progressPercentage == null) {
            progressPercentage = 0;
        }

        updateDates();
    }

    // =========================================================
    // DATE LOGIC
    // =========================================================

    private void updateDates() {

        if (
            progressPercentage > 0 &&
            startedAt == null
        ) {
            startedAt = LocalDateTime.now();
        }

        if (
            progressPercentage == 100 &&
            completedAt == null
        ) {
            completedAt = LocalDateTime.now();
        }
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LearningMilestone getMilestone() {
        return milestone;
    }

    public void setMilestone(LearningMilestone milestone) {
        this.milestone = milestone;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public TrainingStatus getStatus() {
        return status;
    }

    public void setStatus(TrainingStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}