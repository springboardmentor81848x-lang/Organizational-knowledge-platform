package com.okip.entity.transaction;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.okip.entity.master.JobRole;
import com.okip.entity.master.Skill;
import com.okip.enums.ProficiencyLevel;

import jakarta.persistence.*;

@Entity
@Table(name = "job_role_competencies")
public class JobRoleCompetency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_role_competency_id")
    private Long jobRoleCompetencyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_role_id", nullable = false)
    private JobRole jobRole;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "required_proficiency", nullable = false)
    private ProficiencyLevel requiredProficiency;

    @Column(name = "minimum_experience")
    private Double minimumExperience;

    @Column(nullable = false)
    private Boolean mandatory;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public JobRoleCompetency() {
    }

    public Long getJobRoleCompetencyId() {
        return jobRoleCompetencyId;
    }

    public void setJobRoleCompetencyId(Long jobRoleCompetencyId) {
        this.jobRoleCompetencyId = jobRoleCompetencyId;
    }

    public JobRole getJobRole() {
        return jobRole;
    }

    public void setJobRole(JobRole jobRole) {
        this.jobRole = jobRole;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public ProficiencyLevel getRequiredProficiency() {
        return requiredProficiency;
    }

    public void setRequiredProficiency(ProficiencyLevel requiredProficiency) {
        this.requiredProficiency = requiredProficiency;
    }

    public Double getMinimumExperience() {
        return minimumExperience;
    }

    public void setMinimumExperience(Double minimumExperience) {
        this.minimumExperience = minimumExperience;
    }

    public Boolean getMandatory() {
        return mandatory;
    }

    public void setMandatory(Boolean mandatory) {
        this.mandatory = mandatory;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}