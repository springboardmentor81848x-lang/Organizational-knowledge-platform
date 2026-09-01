package com.knowledgegap.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(
    name = "learning_progress",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"employee_id", "course_id"}
        )
    }
)
public class LearningProgress {

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
    // COURSE
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // =========================================================
    // OVERALL PROGRESS
    // =========================================================

    @Column(nullable = false)
    private Integer progressPercentage = 0;

    // =========================================================
    // DATES
    // =========================================================

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

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

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
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