package com.orgskills.intelligence.dto.recommendation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResponse {
    private Long id;
    private Long employeeId;
    private Long skillId;
    private String skillName;
    private String recommendationText;
    private String suggestedResourceType;
    private Integer priorityRank;
    private String sourceGapSeverity;
    private Double relevanceScore;
    private String scoreBreakdown;
    private LocalDateTime generatedAt;
}
