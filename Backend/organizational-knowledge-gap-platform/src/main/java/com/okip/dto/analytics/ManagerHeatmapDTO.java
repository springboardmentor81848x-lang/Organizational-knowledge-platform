package com.okip.dto.analytics;

import java.util.List;
import java.util.Map;

public class ManagerHeatmapDTO {
    private List<String> skillHeaders;
    private List<EmployeeHeatmapRow> employeeRows;

    public ManagerHeatmapDTO() {}

    public List<String> getSkillHeaders() { return skillHeaders; }
    public void setSkillHeaders(List<String> skillHeaders) { this.skillHeaders = skillHeaders; }

    public List<EmployeeHeatmapRow> getEmployeeRows() { return employeeRows; }
    public void setEmployeeRows(List<EmployeeHeatmapRow> employeeRows) { this.employeeRows = employeeRows; }

    public static class EmployeeHeatmapRow {
        private Long employeeId;
        private String employeeCode;
        private String employeeName;
        private String jobRole;
        private Double readinessPercentage;
        private Map<String, SkillCellInfo> skillCells;

        public EmployeeHeatmapRow() {}

        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

        public String getEmployeeCode() { return employeeCode; }
        public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

        public String getEmployeeName() { return employeeName; }
        public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

        public String getJobRole() { return jobRole; }
        public void setJobRole(String jobRole) { this.jobRole = jobRole; }

        public Double getReadinessPercentage() { return readinessPercentage; }
        public void setReadinessPercentage(Double readinessPercentage) { this.readinessPercentage = readinessPercentage; }

        public Map<String, SkillCellInfo> getSkillCells() { return skillCells; }
        public void setSkillCells(Map<String, SkillCellInfo> skillCells) { this.skillCells = skillCells; }
    }

    public static class SkillCellInfo {
        private String currentProficiency;
        private String requiredProficiency;
        private String gapType;
        private Double gapScore;

        public SkillCellInfo() {}
        public SkillCellInfo(String currentProficiency, String requiredProficiency, String gapType, Double gapScore) {
            this.currentProficiency = currentProficiency;
            this.requiredProficiency = requiredProficiency;
            this.gapType = gapType;
            this.gapScore = gapScore;
        }

        public String getCurrentProficiency() { return currentProficiency; }
        public void setCurrentProficiency(String currentProficiency) { this.currentProficiency = currentProficiency; }

        public String getRequiredProficiency() { return requiredProficiency; }
        public void setRequiredProficiency(String requiredProficiency) { this.requiredProficiency = requiredProficiency; }

        public String getGapType() { return gapType; }
        public void setGapType(String gapType) { this.gapType = gapType; }

        public Double getGapScore() { return gapScore; }
        public void setGapScore(Double gapScore) { this.gapScore = gapScore; }
    }
}
