package com.knowledgeiq.model;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "course_id"})
})
public class CourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private TrainingCourse course;

    @Column(nullable = false)
    private String status = "IN_PROGRESS"; // NOT_STARTED, IN_PROGRESS, COMPLETED

    @Column(name = "enrolled_at", insertable = false, updatable = false)
    private ZonedDateTime enrolledAt;

    @Column(name = "completed_at")
    private ZonedDateTime completedAt;

    @Column(name = "progress_percent")
    private Integer progressPercent = 0;

    public CourseEnrollment() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public TrainingCourse getCourse() { return course; }
    public void setCourse(TrainingCourse course) { this.course = course; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

    public ZonedDateTime getEnrolledAt() { return enrolledAt; }

    public ZonedDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(ZonedDateTime completedAt) { this.completedAt = completedAt; }
}
