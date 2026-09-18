package com.orgskills.intelligence.dto.gap;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GapAnalysisResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private Double targetScore;
    private Double currentScore;
    private Double gapScore;
    private String targetProficiency;
    private String currentProficiency;
    @JsonProperty("isMissingSkill")
    private boolean isMissingSkill;
    private RiskSeverity riskSeverity;
}
