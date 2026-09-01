package com.knowledgegap.dto;

import java.util.List;

public class ManagerDashboardResponse {

    // =========================================================
    // OVERVIEW CARDS
    // =========================================================

    private long teamSize;
    private long skillGaps;
    private long inTraining;
    private long highRiskGaps;

    // =========================================================
    // TEAM GAP HEATMAP
    // =========================================================

    private List<ManagerGapHeatmapDTO> teamGapHeatmap;

    // =========================================================
    // DEPARTMENT SKILL COVERAGE
    // =========================================================

    private List<ManagerSkillCoverageDTO> skillCoverage;

    // =========================================================
    // HIGH RISK ALERTS
    // =========================================================

    private List<ManagerHighRiskGapDTO> highRiskAlerts;

    // =========================================================
    // TRAINING ADOPTION
    // =========================================================

    private ManagerTrainingAdoptionDTO trainingAdoption;

    // =========================================================
    // EMPLOYEE PROGRESS
    // =========================================================

    private List<ManagerEmployeeProgressDTO> employeeProgress;

    public ManagerDashboardResponse() {
    }

    public long getTeamSize() {
        return teamSize;
    }

    public void setTeamSize(long teamSize) {
        this.teamSize = teamSize;
    }

    public long getSkillGaps() {
        return skillGaps;
    }

    public void setSkillGaps(long skillGaps) {
        this.skillGaps = skillGaps;
    }

    public long getInTraining() {
        return inTraining;
    }

    public void setInTraining(long inTraining) {
        this.inTraining = inTraining;
    }

    public long getHighRiskGaps() {
        return highRiskGaps;
    }

    public void setHighRiskGaps(long highRiskGaps) {
        this.highRiskGaps = highRiskGaps;
    }

    public List<ManagerGapHeatmapDTO> getTeamGapHeatmap() {
        return teamGapHeatmap;
    }

    public void setTeamGapHeatmap(
            List<ManagerGapHeatmapDTO> teamGapHeatmap) {

        this.teamGapHeatmap = teamGapHeatmap;
    }

    public List<ManagerSkillCoverageDTO> getSkillCoverage() {
        return skillCoverage;
    }

    public void setSkillCoverage(
            List<ManagerSkillCoverageDTO> skillCoverage) {

        this.skillCoverage = skillCoverage;
    }

    public List<ManagerHighRiskGapDTO> getHighRiskAlerts() {
        return highRiskAlerts;
    }

    public void setHighRiskAlerts(
            List<ManagerHighRiskGapDTO> highRiskAlerts) {

        this.highRiskAlerts = highRiskAlerts;
    }

    public ManagerTrainingAdoptionDTO getTrainingAdoption() {
        return trainingAdoption;
    }

    public void setTrainingAdoption(
            ManagerTrainingAdoptionDTO trainingAdoption) {

        this.trainingAdoption = trainingAdoption;
    }

    public List<ManagerEmployeeProgressDTO> getEmployeeProgress() {
        return employeeProgress;
    }

    public void setEmployeeProgress(
            List<ManagerEmployeeProgressDTO> employeeProgress) {

        this.employeeProgress = employeeProgress;
    }
}