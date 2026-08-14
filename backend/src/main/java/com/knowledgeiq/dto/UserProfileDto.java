package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class UserProfileDto {
    private UUID id;
    private String email;
    private String fullName;
    private String systemRole;
    private String title;
    private String department;
    private String company;
    private String bio;
    private String experience;
    private String education;
    private String avatarUrl;
    private List<SkillDto> skills;

    public UserProfileDto() {}

    public UserProfileDto(UUID id, String email, String fullName, String systemRole, String title, String department, String avatarUrl, List<SkillDto> skills) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.systemRole = systemRole;
        this.title = title;
        this.department = department;
        this.avatarUrl = avatarUrl;
        this.skills = skills;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getSystemRole() { return systemRole; }
    public void setSystemRole(String systemRole) { this.systemRole = systemRole; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public List<SkillDto> getSkills() { return skills; }
    public void setSkills(List<SkillDto> skills) { this.skills = skills; }
}
