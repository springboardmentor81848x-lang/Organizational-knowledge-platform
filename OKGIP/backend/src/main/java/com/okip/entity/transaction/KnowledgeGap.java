package com.okip.entity.transaction;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.okip.entity.master.Skill;
import com.okip.enums.GapStatus;
import com.okip.enums.GapType;
import com.okip.enums.ProficiencyLevel;

import jakarta.persistence.*;

@Entity
@Table(name = "knowledge_gaps")
public class KnowledgeGap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "knowledge_gap_id")
    private Long knowledgeGapId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_job_role_id",
            nullable = false)
    private EmployeeJobRole employeeJobRole;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id",
            nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_proficiency")
    private ProficiencyLevel currentProficiency;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_proficiency")
    private ProficiencyLevel requiredProficiency;

    @Column(name = "current_experience")
    private Double currentExperience;

    @Column(name = "required_experience")
    private Double requiredExperience;

    @Enumerated(EnumType.STRING)
    @Column(name = "gap_type",
            nullable = false)
    private GapType gapType;

    @Column(name = "gap_score")
    private Double gapScore;

    @Column(name = "gap_percentage")
    private Double gapPercentage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GapStatus status;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    @CreationTimestamp
    @Column(name = "created_at",
            updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public KnowledgeGap() {
    }

    public Long getKnowledgeGapId() {
        return knowledgeGapId;
    }

    public void setKnowledgeGapId(Long knowledgeGapId) {
        this.knowledgeGapId = knowledgeGapId;
    }

    public EmployeeJobRole getEmployeeJobRole() {
        return employeeJobRole;
    }

    public void setEmployeeJobRole(EmployeeJobRole employeeJobRole) {
        this.employeeJobRole = employeeJobRole;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public ProficiencyLevel getCurrentProficiency() {
        return currentProficiency;
    }

    public void setCurrentProficiency(
            ProficiencyLevel currentProficiency) {
        this.currentProficiency = currentProficiency;
    }

    public ProficiencyLevel getRequiredProficiency() {
        return requiredProficiency;
    }

    public void setRequiredProficiency(
            ProficiencyLevel requiredProficiency) {
        this.requiredProficiency = requiredProficiency;
    }

    public Double getCurrentExperience() {
        return currentExperience;
    }

    public void setCurrentExperience(Double currentExperience) {
        this.currentExperience = currentExperience;
    }

    public Double getRequiredExperience() {
        return requiredExperience;
    }

    public void setRequiredExperience(Double requiredExperience) {
        this.requiredExperience = requiredExperience;
    }

    public GapType getGapType() {
        return gapType;
    }

    public void setGapType(GapType gapType) {
        this.gapType = gapType;
    }

    public Double getGapScore() {
        return gapScore;
    }

    public void setGapScore(Double gapScore) {
        this.gapScore = gapScore;
    }

    public Double getGapPercentage() {
        return gapPercentage;
    }

    public void setGapPercentage(Double gapPercentage) {
        this.gapPercentage = gapPercentage;
    }

    public GapStatus getStatus() {
        return status;
    }

    public void setStatus(GapStatus status) {
        this.status = status;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

}