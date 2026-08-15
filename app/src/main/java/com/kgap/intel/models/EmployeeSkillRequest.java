package com.kgap.intel.models;

public class EmployeeSkillRequest {
    private Long employeeId;
    private Long skillId;
    private String proficiencyLevel;

    public EmployeeSkillRequest(Long employeeId, Long skillId, String proficiencyLevel) {
        this.employeeId = employeeId;
        this.skillId = skillId;
        this.proficiencyLevel = proficiencyLevel;
    }

    public Long getEmployeeId() { return employeeId; }
    public Long getSkillId() { return skillId; }
    public String getProficiencyLevel() { return proficiencyLevel; }
}
