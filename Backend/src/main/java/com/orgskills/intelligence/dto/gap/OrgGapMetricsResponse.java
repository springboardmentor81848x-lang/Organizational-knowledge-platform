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
public class OrgGapMetricsResponse {
    private long totalEmployees;
    private long totalAnalyzedGaps;
    private double overallAverageGapScore;
    private double overallReadinessPercentage;
    private Map<String, Long> riskDistribution;
    private Map<String, Double> departmentAverageGaps;
    private List<SkillGapSummary> topMissingSkills;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SkillGapSummary {
        private Long skillId;
        private String skillName;
        private String category;
        private long affectedEmployeesCount;
        private double averageGapScore;
    }
}
