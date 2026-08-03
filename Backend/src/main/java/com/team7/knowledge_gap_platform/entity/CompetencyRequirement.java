package com.team7.knowledge_gap_platform.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class CompetencyRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long jobRoleId;
    private Long skillId;
    private String requiredProficiencyLevel;

    public CompetencyRequirement() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getRequiredProficiencyLevel() {
        return requiredProficiencyLevel;
    }

    public void setRequiredProficiencyLevel(String requiredProficiencyLevel) {
        this.requiredProficiencyLevel = requiredProficiencyLevel;
    }
}
