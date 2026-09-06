package com.kgap.intel.models;

import com.google.gson.annotations.SerializedName;
import java.io.Serializable;

public class EmployeeSkillResponse implements Serializable {
    private Long id;
    private Long employeeId;
    private Long skillId;
    private String proficiencyLevel;
    
    @SerializedName("proficiencyScore")
    private Double proficiencyScore;

    public Long getId() { return id; }
    public Long getEmployeeId() { return employeeId; }
    public Long getSkillId() { return skillId; }
    public String getProficiencyLevel() { return proficiencyLevel; }
    public Double getProficiencyScore() { return proficiencyScore; }
}
