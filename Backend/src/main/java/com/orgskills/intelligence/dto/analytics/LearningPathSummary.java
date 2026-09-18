package com.orgskills.intelligence.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A learning path as a dashboard needs it: where it is going and how far along it is. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPathSummary {
    private Long learningPathId;
    private String title;
    private Long targetSkillId;
    private String targetSkillName;
    private String status;
    private Integer overallProgressPercent;
    private Integer totalEstimatedHours;
}
