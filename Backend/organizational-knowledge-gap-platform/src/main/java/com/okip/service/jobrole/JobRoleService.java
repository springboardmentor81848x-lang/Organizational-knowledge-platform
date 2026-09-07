package com.okip.service.jobrole;

import java.util.List;

import com.okip.dto.jobrole.CreateJobRoleRequestDTO;
import com.okip.dto.jobrole.JobRoleResponseDTO;

public interface JobRoleService {

    JobRoleResponseDTO createJobRole(
            CreateJobRoleRequestDTO request);

    List<JobRoleResponseDTO> getAllJobRoles();

    JobRoleResponseDTO getJobRoleById(
            Long jobRoleId);

    JobRoleResponseDTO updateJobRole(
            Long jobRoleId,
            CreateJobRoleRequestDTO request);

    void deleteJobRole(
            Long jobRoleId);

}