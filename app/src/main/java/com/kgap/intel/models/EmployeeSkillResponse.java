package com.kgap.intel.models;

import java.io.Serializable;

public class EmployeeSkillResponse implements Serializable {
    private Long id;
    private Long employeeId;
    private Long skillId;
    private String proficiencyLevel;

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public Long getSkillId() { return skillId; }
    public String getProficiencyLevel() { return proficiencyLevel; }
}
