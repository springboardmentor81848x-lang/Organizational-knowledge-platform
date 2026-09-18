package com.knowledgegap.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "assessment_attempts")
public class AssessmentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // EMPLOYEE
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    // =========================================================
    // ASSESSMENT
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "assessment_id")
    private Assessment assessment;

    // =========================================================
    // OVERALL SCORE
    // =========================================================

    @Column(name = "overall_score")
    private Double overallScore;

    // =========================================================
    // PERFORMANCE LEVEL
    // =========================================================

    @Column(name = "performance_level")
    private String performanceLevel;

    // =========================================================
    // COMPLETED AT
    // =========================================================

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // =========================================================
    // ASSESSMENT TYPE
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "assessment_type", length = 30)
    private AssessmentType assessmentType;

    // =========================================================
    // EVALUATOR
    // =========================================================

    @ManyToOne
    @JoinColumn(name = "evaluator_id")
    private Employee evaluator;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AssessmentAttempt() {
    }

    // =========================================================
    // GETTERS / SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Assessment getAssessment() {
        return assessment;
    }

    public void setAssessment(Assessment assessment) {
        this.assessment = assessment;
    }

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public String getPerformanceLevel() {
        return performanceLevel;
    }

    public void setPerformanceLevel(String performanceLevel) {
        this.performanceLevel = performanceLevel;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public AssessmentType getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(AssessmentType assessmentType) {
        this.assessmentType = assessmentType;
    }

    public Employee getEvaluator() {
        return evaluator;
    }

    public void setEvaluator(Employee evaluator) {
        this.evaluator = evaluator;
    }
}