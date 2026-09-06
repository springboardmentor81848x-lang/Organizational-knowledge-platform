package com.team7.knowledge_gap_platform.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "skill_gaps")
public class SkillGap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private Long jobRoleId;
    private Long skillId;

    private String currentProficiency;
    private String requiredProficiency;

    private Integer gapScore;
    private String gapLevel;

    private LocalDateTime analyzedAt;

    public SkillGap() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getJobRoleId() {
        return jobRoleId;
    }

    public void setJobRoleId(Long jobRoleId) {
        this.jobRoleId = jobRoleId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getCurrentProficiency() {
        return currentProficiency;
    }

    public void setCurrentProficiency(String currentProficiency) {
        this.currentProficiency = currentProficiency;
    }

    public String getRequiredProficiency() {
        return requiredProficiency;
    }

    public void setRequiredProficiency(String requiredProficiency) {
        this.requiredProficiency = requiredProficiency;
    }

    public Integer getGapScore() {
        return gapScore;
    }

    public void setGapScore(Integer gapScore) {
        this.gapScore = gapScore;
    }

    public String getGapLevel() {
        return gapLevel;
    }

    public void setGapLevel(String gapLevel) {
        this.gapLevel = gapLevel;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }
}