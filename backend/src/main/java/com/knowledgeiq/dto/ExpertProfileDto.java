package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class ExpertProfileDto {
    private UUID id;
    private String fullName;
    private String email;
    private String roleTitle;
    private String departmentName;
    private String avatarUrl;
    private String bio;
    private List<SkillDto> expertSkills;
    private Long activeMenteesCount;
    private Long completedMentorshipsCount;

    public ExpertProfileDto() {}

    public ExpertProfileDto(UUID id, String fullName, String email, String roleTitle, String departmentName, String avatarUrl, String bio, List<SkillDto> expertSkills, Long activeMenteesCount, Long completedMentorshipsCount) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.roleTitle = roleTitle;
        this.departmentName = departmentName;
        this.avatarUrl = avatarUrl;
        this.bio = bio;
        this.expertSkills = expertSkills;
        this.activeMenteesCount = activeMenteesCount;
        this.completedMentorshipsCount = completedMentorshipsCount;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRoleTitle() { return roleTitle; }
    public void setRoleTitle(String roleTitle) { this.roleTitle = roleTitle; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public List<SkillDto> getExpertSkills() { return expertSkills; }
    public void setExpertSkills(List<SkillDto> expertSkills) { this.expertSkills = expertSkills; }

    public Long getActiveMenteesCount() { return activeMenteesCount; }
    public void setActiveMenteesCount(Long activeMenteesCount) { this.activeMenteesCount = activeMenteesCount; }

    public Long getCompletedMentorshipsCount() { return completedMentorshipsCount; }
    public void setCompletedMentorshipsCount(Long completedMentorshipsCount) { this.completedMentorshipsCount = completedMentorshipsCount; }
}
