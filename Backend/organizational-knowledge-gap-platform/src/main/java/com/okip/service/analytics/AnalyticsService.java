package com.okip.service.analytics;

import java.util.List;
import com.okip.dto.analytics.*;

public interface AnalyticsService {
    EmployeeAnalyticsDTO getEmployeeAnalytics(Long employeeId);
    List<SkillGapAnalyticsDTO> getEmployeeSkillGaps(Long employeeId);
    List<ProficiencyAnalyticsDTO> getEmployeeProficiency(Long employeeId);
    List<TeamAnalyticsDTO> getTeamAnalytics();
    List<DepartmentAnalyticsDTO> getDepartmentAnalytics();
    Long getEmployeeIdByEmail(String email);

    // Milestone 3 Enhancements
    ManagerHeatmapDTO getManagerTeamHeatmap();
    List<HighRiskGapDTO> getHighRiskGaps();
    HRWorkforceSummaryDTO getHRWorkforceSummary();
    List<DepartmentComparisonDTO> getDepartmentComparisons();
    DashboardSummaryDTO getMyDashboardSummary();
    DashboardSummaryDTO getEmployeeDashboardSummary(Long employeeId);
}
