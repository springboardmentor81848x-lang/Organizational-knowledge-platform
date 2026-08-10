package com.okip.dto.gap;

import com.okip.enums.GapStatus;
import com.okip.enums.GapType;
import com.okip.enums.ProficiencyLevel;

public class KnowledgeGapResponseDTO {

    private Long knowledgeGapId;

    private String employeeCode;

    private String employeeName;

    private String jobRoleName;

    private String skillName;

    private ProficiencyLevel currentProficiency;

    private ProficiencyLevel requiredProficiency;

    private Double currentExperience;

    private Double requiredExperience;

    private GapType gapType;

    private Double gapScore;

    private Double gapPercentage;

    private GapStatus status;

    public KnowledgeGapResponseDTO() {
    }

    public Long getKnowledgeGapId() {
        return knowledgeGapId;
    }

    public void setKnowledgeGapId(Long knowledgeGapId) {
        this.knowledgeGapId = knowledgeGapId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getJobRoleName() {
        return jobRoleName;
    }

    public void setJobRoleName(String jobRoleName) {
        this.jobRoleName = jobRoleName;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public ProficiencyLevel getCurrentProficiency() {
        return currentProficiency;
    }

    public void setCurrentProficiency(ProficiencyLevel currentProficiency) {
        this.currentProficiency = currentProficiency;
    }

    public ProficiencyLevel getRequiredProficiency() {
        return requiredProficiency;
    }

    public void setRequiredProficiency(ProficiencyLevel requiredProficiency) {
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
}