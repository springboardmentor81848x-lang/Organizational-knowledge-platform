package com.team7.knowledge_gap_platform.dto;

public class AssessmentComparisonResponse {

    private Long employeeId;
    private Long skillId;

    private Double selfScore;
    private Double peerScore;
    private Double managerScore;

    private Double combinedScore;
    private String combinedProficiencyLevel;

    public AssessmentComparisonResponse() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public Double getSelfScore() {
        return selfScore;
    }

    public void setSelfScore(Double selfScore) {
        this.selfScore = selfScore;
    }

    public Double getPeerScore() {
        return peerScore;
    }

    public void setPeerScore(Double peerScore) {
        this.peerScore = peerScore;
    }

    public Double getManagerScore() {
        return managerScore;
    }

    public void setManagerScore(Double managerScore) {
        this.managerScore = managerScore;
    }

    public Double getCombinedScore() {
        return combinedScore;
    }

    public void setCombinedScore(Double combinedScore) {
        this.combinedScore = combinedScore;
    }

    public String getCombinedProficiencyLevel() {
        return combinedProficiencyLevel;
    }

    public void setCombinedProficiencyLevel(
            String combinedProficiencyLevel) {
        this.combinedProficiencyLevel =
                combinedProficiencyLevel;
    }
}