package com.okip.service.manager;

import java.util.List;
import java.util.Map;

import com.okip.dto.ai.AiRecommendationResponseDTO;
import com.okip.dto.analytics.DepartmentAnalyticsDTO;
import com.okip.dto.analytics.EmployeeAnalyticsDTO;
import com.okip.dto.analytics.ProficiencyAnalyticsDTO;
import com.okip.dto.analytics.SkillGapAnalyticsDTO;
import com.okip.dto.analytics.SkillGapHeatmapDTO;
import com.okip.dto.analytics.TeamAnalyticsDTO;
import com.okip.dto.gap.GapAnalysisResponseDTO;

public interface ManagerService {
    List<TeamAnalyticsDTO> getTeam();
    List<SkillGapHeatmapDTO> getTeamHeatmap();
    List<DepartmentAnalyticsDTO> getTeamDepartments();
    EmployeeAnalyticsDTO getEmployeeSummary(Long employeeId);
    List<SkillGapAnalyticsDTO> getEmployeeGaps(Long employeeId);
    List<ProficiencyAnalyticsDTO> getEmployeeProficiency(Long employeeId);
    GapAnalysisResponseDTO getGapAnalysis(Long employeeId);
    GapAnalysisResponseDTO runGapAnalysis(Long employeeId);
    AiRecommendationResponseDTO generateRecommendation(Long employeeId);
    Map<String,Object> getTrainingAnalytics();
    Map<String,Object> getAssessmentAnalytics();
    Map<String,Object> getReport();
}
