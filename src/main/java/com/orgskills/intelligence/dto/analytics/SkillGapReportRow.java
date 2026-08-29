package com.orgskills.intelligence.dto.analytics;

import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * One skill's org-wide gap picture: what roles demand of it, where the workforce actually sits,
 * and which departments feel the shortfall.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillGapReportRow {
    private Long skillId;
    private String skillName;
    private String category;

    /** Mean level demanded across the roles that require this skill, on the canonical 0-4 scale. */
    private Double requiredScore;
    private ProficiencyLevel requiredLevel;

    private Double currentAverageScore;
    private ProficiencyLevel currentAverageLevel;

    private Double averageGapScore;
    private Long affectedEmployees;

    /** Severity of the average gap, classified with the same thresholds gap analysis uses. */
    private RiskSeverity severity;

    private List<SkillGapDepartmentBreakdown> departmentBreakdown;
}
