package com.okip.service.analytics;

import java.util.List;

import com.okip.dto.analytics.DepartmentAnalyticsDTO;
import com.okip.dto.analytics.EmployeeAnalyticsDTO;
import com.okip.dto.analytics.ProficiencyAnalyticsDTO;
import com.okip.dto.analytics.SkillGapAnalyticsDTO;
import com.okip.dto.analytics.TeamAnalyticsDTO;

public interface AnalyticsService {

    EmployeeAnalyticsDTO getEmployeeAnalytics(Long employeeId);

    List<SkillGapAnalyticsDTO> getEmployeeSkillGaps(
            Long employeeId);

    List<ProficiencyAnalyticsDTO> getEmployeeProficiency(
            Long employeeId);

    List<TeamAnalyticsDTO> getTeamAnalytics();

    List<DepartmentAnalyticsDTO> getDepartmentAnalytics();

    Long getEmployeeIdByEmail(String email);
}