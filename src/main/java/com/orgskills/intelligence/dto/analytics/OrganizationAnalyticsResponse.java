package com.orgskills.intelligence.dto.analytics;

import com.orgskills.intelligence.dto.gap.OrgGapMetricsResponse;
import com.orgskills.intelligence.dto.hr.SkillInventoryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizationAnalyticsResponse {
    private Long totalEmployees;

    private OrgGapMetricsResponse gapIntelligence;

    /** Headcount and average level per skill across the whole workforce. */
    private List<SkillInventoryResponse> workforceSkillInventory;

    private Long totalEnrollments;
    private Long completedEnrollments;
    private Double trainingCompletionRatePercent;

    /** Mean level movement across every submitted assessment, on the canonical 0-4 scale. */
    private Double averageSkillImprovement;
    private Long totalAssessmentResults;

    private Long activeMentorshipCount;

    private Instant generatedAt;
}
