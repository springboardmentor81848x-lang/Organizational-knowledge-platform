package com.knowledgegap.dto;

import java.util.Map;

public class TeamGapEmployeeDTO {

    private String employeeId;
    private String employeeName;

    /*
     * Key   = Skill name
     * Value = Gap level
     *
     * 0 = No gap
     * 1 = Low
     * 2 = Moderate
     * 3 = High
     * 4+ = Critical
     */
    private Map<String, Integer> skillGaps;

    public TeamGapEmployeeDTO() {
    }

    public TeamGapEmployeeDTO(
            String employeeId,
            String employeeName,
            Map<String, Integer> skillGaps) {

        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.skillGaps = skillGaps;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Map<String, Integer> getSkillGaps() {
        return skillGaps;
    }

    public void setSkillGaps(Map<String, Integer> skillGaps) {
        this.skillGaps = skillGaps;
    }
}