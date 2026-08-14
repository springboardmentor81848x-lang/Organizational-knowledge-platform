package com.knowledgeiq.dto;

import java.util.UUID;

public class TeamSkillGapDetailDto {
    private UUID skillId;
    private String skillName;
    private String categoryName;
    private Double teamAvgLevel;
    private Integer requiredLevel;
    private Integer gapPercentage;
    private Boolean isCritical;
    private String riskLevel; // CRITICAL, HIGH, MEDIUM, LOW
    private Integer affectedEmployeeCount;

    public TeamSkillGapDetailDto() {}

    public TeamSkillGapDetailDto(UUID skillId, String skillName, String categoryName, Double teamAvgLevel,
                                Integer requiredLevel, Integer gapPercentage, Boolean isCritical,
                                String riskLevel, Integer affectedEmployeeCount) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.categoryName = categoryName;
        this.teamAvgLevel = teamAvgLevel;
        this.requiredLevel = requiredLevel;
        this.gapPercentage = gapPercentage;
        this.isCritical = isCritical;
        this.riskLevel = riskLevel;
        this.affectedEmployeeCount = affectedEmployeeCount;
    }

    public UUID getSkillId() { return skillId; }
    public void setSkillId(UUID skillId) { this.skillId = skillId; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Double getTeamAvgLevel() { return teamAvgLevel; }
    public void setTeamAvgLevel(Double teamAvgLevel) { this.teamAvgLevel = teamAvgLevel; }

    public Integer getRequiredLevel() { return requiredLevel; }
    public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }

    public Integer getGapPercentage() { return gapPercentage; }
    public void setGapPercentage(Integer gapPercentage) { this.gapPercentage = gapPercentage; }

    public Boolean getIsCritical() { return isCritical; }
    public void setIsCritical(Boolean isCritical) { this.isCritical = isCritical; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Integer getAffectedEmployeeCount() { return affectedEmployeeCount; }
    public void setAffectedEmployeeCount(Integer affectedEmployeeCount) { this.affectedEmployeeCount = affectedEmployeeCount; }
}
