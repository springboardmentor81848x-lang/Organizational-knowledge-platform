package com.knowledgegap.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "learning_progress_history")
public class LearningProgressHistory {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // TRAINING ENROLLMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private TrainingEnrollment enrollment;

    // =========================================================
    // EMPLOYEE
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // =========================================================
    // COURSE
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // =========================================================
    // PROGRESS
    // =========================================================

    @Column(nullable = false)
    private Integer progressPercentage;

    // =========================================================
    // EVENT TYPE
    // =========================================================

    @Column(name = "event_type")
    private String eventType;

    // =========================================================
    // DATE / TIME
    // =========================================================

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public LearningProgressHistory() {
    }

    public LearningProgressHistory(
            TrainingEnrollment enrollment,
            Employee employee,
            Course course,
            Integer progressPercentage,
            String eventType,
            LocalDateTime recordedAt) {

        this.enrollment = enrollment;
        this.employee = employee;
        this.course = course;
        this.progressPercentage = progressPercentage;
        this.eventType = eventType;
        this.recordedAt = recordedAt;
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public TrainingEnrollment getEnrollment() {
        return enrollment;
    }

    public void setEnrollment(TrainingEnrollment enrollment) {
        this.enrollment = enrollment;
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

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    // =========================================================
    // AUTO TIMESTAMP
    // =========================================================

    @PrePersist
    protected void onCreate() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }
}