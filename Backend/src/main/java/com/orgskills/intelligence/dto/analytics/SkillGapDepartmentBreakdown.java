package com.orgskills.intelligence.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** How one department contributes to a single skill's gap. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGapDepartmentBreakdown {
    private String department;
    private Long affectedEmployees;
    private Double averageGapScore;
}
