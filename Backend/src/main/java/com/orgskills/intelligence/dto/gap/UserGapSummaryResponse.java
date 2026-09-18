package com.orgskills.intelligence.dto.gap;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserGapSummaryResponse {
    private Long userId;
    private String userName;
    private String jobTitle;
    private String department;
    private int totalRequiredSkills;
    private int metSkillsCount;
    private int missingSkillsCount;
    private int proficiencyGapsCount;
    private double overallReadinessPercentage;
    private double averageGapScore;
    private Map<String, Long> riskDistribution;
    private List<GapAnalysisResponse> topCriticalGaps;
}
