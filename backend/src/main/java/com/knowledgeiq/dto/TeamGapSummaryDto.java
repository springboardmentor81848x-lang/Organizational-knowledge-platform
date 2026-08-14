package com.knowledgeiq.dto;

import java.util.List;
import java.util.UUID;

public class TeamGapSummaryDto {
    private UUID teamId;
    private String teamName;
    private String managerName;
    private Integer totalTeamMembers;
    private Integer criticalGapsCount;
    private Double avgGapPercentage;
    private List<TeamSkillGapDetailDto> skillGaps;
    private List<GapAlertDto> alerts;

    public TeamGapSummaryDto() {}

    public TeamGapSummaryDto(UUID teamId, String teamName, String managerName, Integer totalTeamMembers,
                             Integer criticalGapsCount, Double avgGapPercentage,
                             List<TeamSkillGapDetailDto> skillGaps, List<GapAlertDto> alerts) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.managerName = managerName;
        this.totalTeamMembers = totalTeamMembers;
        this.criticalGapsCount = criticalGapsCount;
        this.avgGapPercentage = avgGapPercentage;
        this.skillGaps = skillGaps;
        this.alerts = alerts;
    }

    public UUID getTeamId() { return teamId; }
    public void setTeamId(UUID teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }

    public Integer getTotalTeamMembers() { return totalTeamMembers; }
    public void setTotalTeamMembers(Integer totalTeamMembers) { this.totalTeamMembers = totalTeamMembers; }

    public Integer getTeamSize() { return totalTeamMembers; }

    public Integer getCriticalGapsCount() { return criticalGapsCount; }
    public void setCriticalGapsCount(Integer criticalGapsCount) { this.criticalGapsCount = criticalGapsCount; }

    public Integer getCriticalGaps() { return criticalGapsCount; }

    public Double getAvgGapPercentage() { return avgGapPercentage; }
    public void setAvgGapPercentage(Double avgGapPercentage) { this.avgGapPercentage = avgGapPercentage; }

    public List<TeamSkillGapDetailDto> getSkillGaps() { return skillGaps; }
    public void setSkillGaps(List<TeamSkillGapDetailDto> skillGaps) { this.skillGaps = skillGaps; }

    public List<GapAlertDto> getAlerts() { return alerts; }
    public void setAlerts(List<GapAlertDto> alerts) { this.alerts = alerts; }
}
