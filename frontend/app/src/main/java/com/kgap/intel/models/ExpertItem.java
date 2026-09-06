package com.kgap.intel.models;

import java.io.Serializable;

public class ExpertItem implements Serializable {
    private Long employeeId;
    private String expertName;
    private String skillName;
    private String proficiency;
    private String department;
    private String role;
    private String bio;

    public ExpertItem() {}

    public ExpertItem(Long employeeId, String expertName, String skillName, String proficiency, String department, String role, String bio) {
        this.employeeId = employeeId;
        this.expertName = expertName;
        this.skillName = skillName;
        this.proficiency = proficiency;
        this.department = department;
        this.role = role;
        this.bio = bio;
    }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getExpertName() { return expertName != null ? expertName : "Expert #" + employeeId; }
    public void setExpertName(String expertName) { this.expertName = expertName; }

    public String getSkillName() { return skillName != null ? skillName : "General Expertise"; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getProficiency() { return proficiency != null ? proficiency : "EXPERT"; }
    public void setProficiency(String proficiency) { this.proficiency = proficiency; }

    public String getDepartment() { return department != null ? department : "Engineering"; }
    public void setDepartment(String department) { this.department = department; }

    public String getRole() { return role != null ? role : "Internal Subject Matter Expert"; }
    public void setRole(String role) { this.role = role; }

    public String getBio() { return bio != null ? bio : ""; }
    public void setBio(String bio) { this.bio = bio; }
}
