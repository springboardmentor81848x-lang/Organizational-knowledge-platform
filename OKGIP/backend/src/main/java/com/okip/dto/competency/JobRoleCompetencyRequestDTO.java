package com.okip.dto.competency;

import com.okip.enums.ProficiencyLevel;

public class JobRoleCompetencyRequestDTO {

    private Long jobRoleId;

    private Long skillId;

    private ProficiencyLevel requiredProficiency;

    private Double minimumExperience;

    private Boolean mandatory;

    public JobRoleCompetencyRequestDTO() {
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
}