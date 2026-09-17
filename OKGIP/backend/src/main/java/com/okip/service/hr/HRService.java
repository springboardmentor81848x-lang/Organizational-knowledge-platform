package com.okip.service.hr;

import java.util.List;
import java.util.Map;

import com.okip.dto.hr.EmployeeApprovalResponseDTO;
import com.okip.dto.hr.HRDashboardDTO;
import com.okip.dto.hr.PendingEmployeeDTO;

public interface HRService {

    EmployeeApprovalResponseDTO approveEmployee(Long employeeId);

    EmployeeApprovalResponseDTO rejectEmployee(Long employeeId);

    List<PendingEmployeeDTO> getPendingEmployees();

    HRDashboardDTO getDashboard();

    List<Map<String, Object>> getEmployees();
    List<Map<String, Object>> getDepartments();
    List<Map<String, Object>> getJobRoles();
    List<Map<String, Object>> getWorkforceSkills();
    List<Map<String, Object>> getCompetencies();
    List<Map<String, Object>> getKnowledgeGaps();
    Map<String, Object> getTrainingAnalytics();
    List<Map<String, Object>> getAssessments();
}
