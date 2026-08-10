package com.okip.dto.gap;

import java.util.List;

public class GapAnalysisResponseDTO {

    private String employeeCode;

    private String employeeName;

    private String jobRoleName;

    private Integer totalSkills;

    private Integer completedSkills;

    private Integer gapSkills;

    private Double overallGapPercentage;

    private Double readinessPercentage;

    private List<KnowledgeGapResponseDTO> knowledgeGaps;

    public GapAnalysisResponseDTO() {
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

    public Integer getTotalSkills() {
        return totalSkills;
    }

    public void setTotalSkills(Integer totalSkills) {
        this.totalSkills = totalSkills;
    }

    public Integer getCompletedSkills() {
        return completedSkills;
    }

    public void setCompletedSkills(Integer completedSkills) {
        this.completedSkills = completedSkills;
    }

    public Integer getGapSkills() {
        return gapSkills;
    }

    public void setGapSkills(Integer gapSkills) {
        this.gapSkills = gapSkills;
    }

    public Double getOverallGapPercentage() {
        return overallGapPercentage;
    }

    public void setOverallGapPercentage(Double overallGapPercentage) {
        this.overallGapPercentage = overallGapPercentage;
    }

    public Double getReadinessPercentage() {
        return readinessPercentage;
    }

    public void setReadinessPercentage(Double readinessPercentage) {
        this.readinessPercentage = readinessPercentage;
    }

    public List<KnowledgeGapResponseDTO> getKnowledgeGaps() {
        return knowledgeGaps;
    }

    public void setKnowledgeGaps(List<KnowledgeGapResponseDTO> knowledgeGaps) {
        this.knowledgeGaps = knowledgeGaps;
    }

}