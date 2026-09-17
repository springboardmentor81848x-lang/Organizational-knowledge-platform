package com.okip.service.admin;

import java.util.List;
import java.util.Map;

import com.okip.dto.admin.CreateUserRequestDTO;
import com.okip.dto.admin.CreateUserResponseDTO;
import com.okip.enums.AccountStatus;

public interface AdminService {
    CreateUserResponseDTO createUser(CreateUserRequestDTO request);
    Map<String, Object> getDashboard();
    List<Map<String, Object>> getUsers();
    List<Map<String, Object>> getRoles();
    List<Map<String, Object>> getDepartments();
    List<Map<String, Object>> getSkills();
    List<Map<String, Object>> getJobRoles();
    List<Map<String, Object>> getTrainings();
    List<Map<String, Object>> getGaps();
    List<Map<String, Object>> getAssessments();
    List<Map<String, Object>> getMentorships();
    Map<String, Object> getSystemHealth();
    Map<String, Object> getSystemConfiguration();
    Map<String, Object> updateUserStatus(Long employeeId, AccountStatus status);
    Map<String, Object> updateUserRole(Long employeeId, Long roleId);
}
