package com.orgskills.intelligence.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** How widely one skill gap is felt across a group, and how deep it runs on average. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGapFrequency {
    private Long skillId;
    private String skillName;
    private String category;
    private Long affectedEmployees;
    private Long criticalCount;
    private Double averageGapScore;
}
