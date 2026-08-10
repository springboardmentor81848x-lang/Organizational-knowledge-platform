package com.okip.dto.competency;

import com.okip.enums.ProficiencyLevel;

public class JobRoleCompetencyResponseDTO {

    private Long jobRoleCompetencyId;

    private Long jobRoleId;

    private String jobRoleName;

    private Long skillId;

    private String skillName;

    private ProficiencyLevel requiredProficiency;

    private Double minimumExperience;

    private Boolean mandatory;

    public JobRoleCompetencyResponseDTO() {
    }

    public Long getJobRoleCompetencyId() {
        return jobRoleCompetencyId;
    }

    public void setJobRoleCompetencyId(Long jobRoleCompetencyId) {
        this.jobRoleCompetencyId = jobRoleCompetencyId;
    }

    public Long getJobRoleId() {
        return jobRoleId;
    }

    public void setJobRoleId(Long jobRoleId) {
        this.jobRoleId = jobRoleId;
    }

    public String getJobRoleName() {
        return jobRoleName;
    }

    public void setJobRoleName(String jobRoleName) {
        this.jobRoleName = jobRoleName;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
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