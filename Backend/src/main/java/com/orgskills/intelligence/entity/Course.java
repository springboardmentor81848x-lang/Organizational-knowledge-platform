package com.orgskills.intelligence.entity;

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

import java.time.Instant;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 3000)
    private String description;

    @Column(nullable = false)
    private String provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skillCovered;

    private String difficulty;

    private Double durationHours;

    private String durationLabel;

    @Column(nullable = false)
    private Boolean isInternal = true;

    private String externalUrl;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    public Course() {
    }

    public Course(Long id, String title, String description, String provider, Skill skillCovered, String difficulty, Double durationHours, Boolean isInternal, String externalUrl, Instant createdAt) {
        this(id, title, description, provider, skillCovered, difficulty, durationHours, null, isInternal, externalUrl, createdAt);
    }

    public Course(Long id, String title, String description, String provider, Skill skillCovered, String difficulty, Double durationHours, String durationLabel, Boolean isInternal, String externalUrl, Instant createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.provider = provider;
        this.skillCovered = skillCovered;
        this.difficulty = difficulty;
        this.durationHours = durationHours;
        this.durationLabel = durationLabel;
        this.isInternal = isInternal;
        this.externalUrl = externalUrl;
        this.createdAt = createdAt;
    }

    @PrePersist
    public void prePersist() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public Skill getSkillCovered() {
        return skillCovered;
    }

    public void setSkillCovered(Skill skillCovered) {
        this.skillCovered = skillCovered;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Double getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Double durationHours) {
        this.durationHours = durationHours;
    }

    public String getDurationLabel() {
        return durationLabel;
    }

    public void setDurationLabel(String durationLabel) {
        this.durationLabel = durationLabel;
    }

    public Boolean getIsInternal() {
        return isInternal;
    }

    public void setIsInternal(Boolean isInternal) {
        this.isInternal = isInternal;
    }

    public String getExternalUrl() {
        return externalUrl;
    }

    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
