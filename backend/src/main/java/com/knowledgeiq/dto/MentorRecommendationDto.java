package com.knowledgeiq.dto;

import java.util.UUID;

public class MentorRecommendationDto {
    private UUID mentorId;
    private String fullName;
    private String email;
    private String roleTitle;
    private String departmentName;
    private String avatarUrl;
    
    private UUID skillId;
    private String skillName;
    
    private Integer menteeProficiency;
    private Integer mentorProficiency;
    private Integer requiredProficiency;
    private Integer gapLevel;
    private Integer matchScore;
    private String reason;
    private Long activeMenteesCount;

    public MentorRecommendationDto() {}

    public MentorRecommendationDto(UUID mentorId, String fullName, String email, String roleTitle, String departmentName, String avatarUrl, UUID skillId, String skillName, Integer menteeProficiency, Integer mentorProficiency, Integer requiredProficiency, Integer gapLevel, Integer matchScore, String reason, Long activeMenteesCount) {
        this.mentorId = mentorId;
        this.fullName = fullName;
        this.email = email;
        this.roleTitle = roleTitle;
        this.departmentName = departmentName;
        this.avatarUrl = avatarUrl;
        this.skillId = skillId;
        this.skillName = skillName;
        this.menteeProficiency = menteeProficiency;
        this.mentorProficiency = mentorProficiency;
        this.requiredProficiency = requiredProficiency;
        this.gapLevel = gapLevel;
        this.matchScore = matchScore;
        this.reason = reason;
        this.activeMenteesCount = activeMenteesCount;
    }

    public UUID getMentorId() { return mentorId; }
    public void setMentorId(UUID mentorId) { this.mentorId = mentorId; }

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

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public Integer getMenteeProficiency() { return menteeProficiency; }
    public void setMenteeProficiency(Integer menteeProficiency) { this.menteeProficiency = menteeProficiency; }

    public Integer getMentorProficiency() { return mentorProficiency; }
    public void setMentorProficiency(Integer mentorProficiency) { this.mentorProficiency = mentorProficiency; }

    public Integer getRequiredProficiency() { return requiredProficiency; }
    public void setRequiredProficiency(Integer requiredProficiency) { this.requiredProficiency = requiredProficiency; }

    public Integer getGapLevel() { return gapLevel; }
    public void setGapLevel(Integer gapLevel) { this.gapLevel = gapLevel; }

    public Integer getMatchScore() { return matchScore; }
    public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getActiveMenteesCount() { return activeMenteesCount; }
    public void setActiveMenteesCount(Long activeMenteesCount) { this.activeMenteesCount = activeMenteesCount; }
}
