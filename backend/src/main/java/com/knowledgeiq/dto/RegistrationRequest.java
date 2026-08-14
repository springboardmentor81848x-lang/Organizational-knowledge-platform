package com.knowledgeiq.dto;

import java.util.List;

public class RegistrationRequest {
    private String fullName;
    private String email;
    private String password;
    private String role;
    private String departmentName;
    private String roleTitle;
    private String company;
    private String bio;
    private String education;
    private String experience;
    private List<SkillRatingDto> skills;
    private List<SkillRatingDto> roleBenchmarks;
    public static class SkillRatingDto {
        private String skillId;
        private String skillName;
        private Integer proficiencyLevel;

        public SkillRatingDto() {}

        public SkillRatingDto(String skillId, String skillName, Integer proficiencyLevel) {
            this.skillId = skillId;
            this.skillName = skillName;
            this.proficiencyLevel = proficiencyLevel;
        }

        public String getSkillId() { return skillId; }
        public void setSkillId(String skillId) { this.skillId = skillId; }

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }

        public Integer getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(Integer proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }
    }

    public RegistrationRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public List<SkillRatingDto> getSkills() { return skills; }
    public void setSkills(List<SkillRatingDto> skills) { this.skills = skills; }

    public List<SkillRatingDto> getRoleBenchmarks() { return roleBenchmarks; }
    public void setRoleBenchmarks(List<SkillRatingDto> roleBenchmarks) { this.roleBenchmarks = roleBenchmarks; }
}
