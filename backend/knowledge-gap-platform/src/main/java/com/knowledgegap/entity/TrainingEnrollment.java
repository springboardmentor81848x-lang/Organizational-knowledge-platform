package com.knowledgegap.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "training_enrollments")
public class TrainingEnrollment {

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
    // TRAINING STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TrainingStatus status = TrainingStatus.NOT_STARTED;

    // =========================================================
    // PROGRESS
    // =========================================================

    @Column(nullable = false)
    private Integer progressPercentage = 0;

    // =========================================================
    // TRAINING DATES
    // =========================================================

    private LocalDate startDate;

    private LocalDate expectedCompletionDate;

    private LocalDate actualCompletionDate;

    // =========================================================
    // CERTIFICATION
    // =========================================================

    private String certificationName;

    private LocalDate certificationIssuedDate;

    private LocalDate certificationExpiryDate;

    @Column(length = 1000)
    private String certificationUrl;

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
    }

    // =========================================================
    // PRE UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
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

    public TrainingStatus getStatus() {
        return status;
    }

    public void setStatus(TrainingStatus status) {
        this.status = status;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getExpectedCompletionDate() {
        return expectedCompletionDate;
    }

    public void setExpectedCompletionDate(
            LocalDate expectedCompletionDate) {

        this.expectedCompletionDate = expectedCompletionDate;
    }

    public LocalDate getActualCompletionDate() {
        return actualCompletionDate;
    }

    public void setActualCompletionDate(
            LocalDate actualCompletionDate) {

        this.actualCompletionDate = actualCompletionDate;
    }

    // =========================================================
    // CERTIFICATION GETTERS / SETTERS
    // =========================================================

    public String getCertificationName() {
        return certificationName;
    }

    public void setCertificationName(String certificationName) {
        this.certificationName = certificationName;
    }

    public LocalDate getCertificationIssuedDate() {
        return certificationIssuedDate;
    }

    public void setCertificationIssuedDate(
            LocalDate certificationIssuedDate) {

        this.certificationIssuedDate = certificationIssuedDate;
    }

    public LocalDate getCertificationExpiryDate() {
        return certificationExpiryDate;
    }

    public void setCertificationExpiryDate(
            LocalDate certificationExpiryDate) {

        this.certificationExpiryDate = certificationExpiryDate;
    }

    public String getCertificationUrl() {
        return certificationUrl;
    }

    public void setCertificationUrl(String certificationUrl) {
        this.certificationUrl = certificationUrl;
    }

    // =========================================================
    // CREATED / UPDATED GETTERS
    // =========================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}