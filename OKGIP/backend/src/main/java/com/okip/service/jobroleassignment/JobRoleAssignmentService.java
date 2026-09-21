package com.okip.service.jobroleassignment;

import java.util.List;

import com.okip.dto.jobroleassignment.AssignJobRoleRequestDTO;
import com.okip.dto.jobroleassignment.JobRoleAssignmentResponseDTO;

public interface JobRoleAssignmentService {

    JobRoleAssignmentResponseDTO assignJobRole(
            AssignJobRoleRequestDTO request);

    List<JobRoleAssignmentResponseDTO> getMyAssignedRoles();

    List<JobRoleAssignmentResponseDTO> getEmployeeAssignedRoles(
            Long employeeId);

    JobRoleAssignmentResponseDTO updateAssignment(
            Long employeeJobRoleId,
            AssignJobRoleRequestDTO request);

    JobRoleAssignmentResponseDTO assignMyRole(
        AssignJobRoleRequestDTO request);

    void deleteAssignment(
            Long employeeJobRoleId);

}