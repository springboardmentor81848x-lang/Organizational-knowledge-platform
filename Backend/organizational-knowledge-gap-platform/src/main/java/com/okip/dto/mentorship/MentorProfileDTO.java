package com.okip.dto.mentorship;

import java.util.List;

public class MentorProfileDTO {
    private Long employeeId;
    private String employeeCode;
    private String fullName;
    private String email;
    private String department;
    private String jobRole;
    private String bio;
    private List<ExpertSkillDTO> expertSkills;
    private int activeMenteesCount;
    private boolean availableForMentorship;

    public MentorProfileDTO() {}

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public List<ExpertSkillDTO> getExpertSkills() { return expertSkills; }
    public void setExpertSkills(List<ExpertSkillDTO> expertSkills) { this.expertSkills = expertSkills; }

    public int getActiveMenteesCount() { return activeMenteesCount; }
    public void setActiveMenteesCount(int activeMenteesCount) { this.activeMenteesCount = activeMenteesCount; }

    public boolean isAvailableForMentorship() { return availableForMentorship; }
    public void setAvailableForMentorship(boolean availableForMentorship) { this.availableForMentorship = availableForMentorship; }

    public static class ExpertSkillDTO {
        private Long skillId;
        private String skillName;
        private String category;
        private String proficiencyLevel;
        private Double yearsOfExperience;

        public ExpertSkillDTO() {}
        public ExpertSkillDTO(Long skillId, String skillName, String category, String proficiencyLevel, Double yearsOfExperience) {
            this.skillId = skillId;
            this.skillName = skillName;
            this.category = category;
            this.proficiencyLevel = proficiencyLevel;
            this.yearsOfExperience = yearsOfExperience;
        }

        public Long getSkillId() { return skillId; }
        public void setSkillId(Long skillId) { this.skillId = skillId; }

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(String proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }

        public Double getYearsOfExperience() { return yearsOfExperience; }
        public void setYearsOfExperience(Double yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    }
}
