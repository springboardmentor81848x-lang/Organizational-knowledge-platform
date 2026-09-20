package com.okip.dto.mentorship;

public class MentorRecommendationDTO {
    private Long employeeId;
    private String employeeCode;
    private String name;
    private String department;
    private String role;
    private Long skillId;
    private String skillName;
    private String proficiency;
    private Double yearsOfExperience;
    private Double gapPercentage;

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getSkillId() { return skillId; }
    public void setSkillId(Long skillId) { this.skillId = skillId; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public String getProficiency() { return proficiency; }
    public void setProficiency(String proficiency) { this.proficiency = proficiency; }
    public Double getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Double yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public Double getGapPercentage() { return gapPercentage; }
    public void setGapPercentage(Double gapPercentage) { this.gapPercentage = gapPercentage; }
}
