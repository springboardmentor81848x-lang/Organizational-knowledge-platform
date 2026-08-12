package com.kgap.intel.models;

import java.io.Serializable;

public class SkillGapResponse implements Serializable {
    private Long id;
    private Long employeeId;
    private Long skillId;
    private String currentProficiency;
    private String requiredProficiency;
    private Integer gapScore;
    private String gapLevel;
    
    // Frontend only fields
    private String skillName;
    private String employeeName;

    public SkillGapResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public String getCurrentProficiency() { return currentProficiency; }
    public void setCurrentProficiency(String currentProficiency) { this.currentProficiency = currentProficiency; }

    public String getRequiredProficiency() { return requiredProficiency; }
    public void setRequiredProficiency(String requiredProficiency) { this.requiredProficiency = requiredProficiency; }

    public Integer getGapScore() { return gapScore; }
    public void setGapScore(Integer gapScore) { this.gapScore = gapScore; }

    public String getGapLevel() { return gapLevel; }
    public void setGapLevel(String gapLevel) { this.gapLevel = gapLevel; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
}
