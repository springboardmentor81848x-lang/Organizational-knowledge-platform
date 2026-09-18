package com.knowledgegap.entity;

import java.time.LocalDateTime;

import com.knowledgegap.enums.AssessmentType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "assessment_results")
public class AssessmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;

    private Long evaluatorId;

    private Long skillId;

    @Enumerated(EnumType.STRING)
    private AssessmentType assessmentType;

    private Integer previousLevel;

    private Integer currentLevel;

    private Integer improvement;

    private LocalDateTime assessmentDate;

    public AssessmentResult() {
    }

    @PrePersist
    public void prePersist() {
        assessmentDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getEvaluatorId() {
        return evaluatorId;
    }

    public void setEvaluatorId(Long evaluatorId) {
        this.evaluatorId = evaluatorId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public AssessmentType getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(
            AssessmentType assessmentType) {

        this.assessmentType = assessmentType;
    }

    public Integer getPreviousLevel() {
        return previousLevel;
    }

    public void setPreviousLevel(
            Integer previousLevel) {

        this.previousLevel = previousLevel;
    }

    public Integer getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(
            Integer currentLevel) {

        this.currentLevel = currentLevel;
    }

    public Integer getImprovement() {
        return improvement;
    }

    public void setImprovement(
            Integer improvement) {

        this.improvement = improvement;
    }

    public LocalDateTime getAssessmentDate() {
        return assessmentDate;
    }

    public void setAssessmentDate(
            LocalDateTime assessmentDate) {

        this.assessmentDate = assessmentDate;
    }
}