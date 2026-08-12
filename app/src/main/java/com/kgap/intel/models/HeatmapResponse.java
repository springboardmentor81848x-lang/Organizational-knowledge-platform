package com.kgap.intel.models;

import java.io.Serializable;

public class HeatmapResponse implements Serializable {
    private Long employeeId;
    private Long skillId;
    private Integer gapScore;
    private String gapLevel;
    private String color;

    // Frontend only fields
    private String skillName;
    private String employeeName;

    public HeatmapResponse() {}

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }

    public Integer getGapScore() { return gapScore; }
    public void setGapScore(Integer gapScore) { this.gapScore = gapScore; }

    public String getGapLevel() { return gapLevel; }
    public void setGapLevel(String gapLevel) { this.gapLevel = gapLevel; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
}
