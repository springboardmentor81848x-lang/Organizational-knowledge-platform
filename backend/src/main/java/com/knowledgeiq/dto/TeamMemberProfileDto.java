package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class TeamMemberProfileDto {
    private UUID id;
    private String fullName;
    private String email;
    private String roleTitle;
    private String departmentName;
    private String avatarUrl;
    private Integer currentSkillLevel;
    private Integer targetSkillLevel;
    private Integer gapPercentage;
    private Integer criticalGapsCount;
    private String riskStatus; // "On Track", "At Risk", "Critical Risk"
    private String activeTrainingStatus;
    private List<SkillDto> skills;

    public TeamMemberProfileDto() {}

    public TeamMemberProfileDto(UUID id, String fullName, String email, String roleTitle, String departmentName,
                                String avatarUrl, Integer currentSkillLevel, Integer targetSkillLevel,
                                Integer gapPercentage, Integer criticalGapsCount, String riskStatus,
                                String activeTrainingStatus, List<SkillDto> skills) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.roleTitle = roleTitle;
        this.departmentName = departmentName;
        this.avatarUrl = avatarUrl;
        this.currentSkillLevel = currentSkillLevel;
        this.targetSkillLevel = targetSkillLevel;
        this.gapPercentage = gapPercentage;
        this.criticalGapsCount = criticalGapsCount;
        this.riskStatus = riskStatus;
        this.activeTrainingStatus = activeTrainingStatus;
        this.skills = skills;
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

    public Integer getCurrentSkillLevel() { return currentSkillLevel; }
    public void setCurrentSkillLevel(Integer currentSkillLevel) { this.currentSkillLevel = currentSkillLevel; }

    public Integer getTargetSkillLevel() { return targetSkillLevel; }
    public void setTargetSkillLevel(Integer targetSkillLevel) { this.targetSkillLevel = targetSkillLevel; }

    public Integer getGapPercentage() { return gapPercentage; }
    public void setGapPercentage(Integer gapPercentage) { this.gapPercentage = gapPercentage; }

    public Integer getCriticalGapsCount() { return criticalGapsCount; }
    public void setCriticalGapsCount(Integer criticalGapsCount) { this.criticalGapsCount = criticalGapsCount; }

    public String getRiskStatus() { return riskStatus; }
    public void setRiskStatus(String riskStatus) { this.riskStatus = riskStatus; }

    public String getActiveTrainingStatus() { return activeTrainingStatus; }
    public void setActiveTrainingStatus(String activeTrainingStatus) { this.activeTrainingStatus = activeTrainingStatus; }

    public List<SkillDto> getSkills() { return skills; }
    public void setSkills(List<SkillDto> skills) { this.skills = skills; }
}
