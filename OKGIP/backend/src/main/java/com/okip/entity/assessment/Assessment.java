package com.okip.entity.assessment;

import java.time.LocalDateTime;

import com.okip.entity.master.Skill;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "assessments")
public class Assessment {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assessmentId;


    // ============================================================
    // SKILL
    // ============================================================

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;


    // ============================================================
    // ASSESSMENT TYPE
    // ============================================================

    public enum AssessmentType {
        SELF,
        PEER,
        MANAGER
    }

    @Enumerated(EnumType.STRING)
    @Column(
        name = "assessment_type",
        nullable = false,
        length = 30
    )
    private AssessmentType assessmentType = AssessmentType.SELF;


    // ============================================================
    // ASSESSMENT NAME
    // ============================================================

    @Column(
        name = "assessment_name",
        nullable = false,
        length = 150
    )
    private String assessmentName;


    // ============================================================
    // TOTAL MARKS
    // ============================================================

    @Column(
        name = "total_marks",
        nullable = false
    )
    private Integer totalMarks;


    // ============================================================
    // ACTIVE
    // ============================================================

    @Column(
        name = "active",
        nullable = false
    )
    private boolean active = true;


    // ============================================================
    // CREATED AT
    // ============================================================

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;


    // ============================================================
    // UPDATED AT
    // ============================================================

    @Column(
        name = "updated_at"
    )
    private LocalDateTime updatedAt;


    // ============================================================
    // AUTOMATIC CREATE TIMESTAMP
    // ============================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }


    // ============================================================
    // AUTOMATIC UPDATE TIMESTAMP
    // ============================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }


    // ============================================================
    // GETTERS AND SETTERS
    // ============================================================

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }


    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }


    public AssessmentType getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(
            AssessmentType assessmentType) {

        this.assessmentType = assessmentType;
    }


    public String getAssessmentName() {
        return assessmentName;
    }

    public void setAssessmentName(
            String assessmentName) {

        this.assessmentName = assessmentName;
    }


    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(
            Integer totalMarks) {

        this.totalMarks = totalMarks;
    }


    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {

        this.updatedAt = updatedAt;
    }
}