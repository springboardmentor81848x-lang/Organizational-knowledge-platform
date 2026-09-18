package com.orgskills.intelligence.dto.analytics;

import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.dto.manager.GapHeatmapResponse;
import com.orgskills.intelligence.dto.manager.TeamMemberSummary;
import com.orgskills.intelligence.dto.manager.TrainingAdoptionResponse;
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
public class TeamAnalyticsResponse {
    private Long managerId;
    private String managerName;
    private Integer teamSize;

    private GapHeatmapResponse gapHeatmap;

    /** Gaps at severity HIGH exactly, which is what the alert list is for. */
    private List<GapAnalysisResponse> highRiskGapAlerts;

    private List<TeamMemberSummary> memberSnapshots;
    private TrainingAdoptionResponse trainingAdoption;
    private List<ImprovedAfterTraining> improvedAfterTraining;
    private List<TrainingProgramUptake> topTrainingPrograms;

    private Instant generatedAt;
}
