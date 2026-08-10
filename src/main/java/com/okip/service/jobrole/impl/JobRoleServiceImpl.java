package com.okip.service.jobrole.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.okip.dto.jobrole.CreateJobRoleRequestDTO;
import com.okip.dto.jobrole.JobRoleResponseDTO;
import com.okip.entity.master.JobRole;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.JobRoleRepository;
import com.okip.service.jobrole.JobRoleService;

@Service
public class JobRoleServiceImpl
        implements JobRoleService {

    private final JobRoleRepository jobRoleRepository;

    public JobRoleServiceImpl(
            JobRoleRepository jobRoleRepository) {

        this.jobRoleRepository = jobRoleRepository;
    }

    @Override
    public JobRoleResponseDTO createJobRole(
            CreateJobRoleRequestDTO request) {

        if (jobRoleRepository
                .findByJobRoleNameIgnoreCase(
                        request.getJobRoleName())
                .isPresent()) {

            throw new ResourceAlreadyExistsException(
                    "Job Role already exists.");
        }

        JobRole jobRole = new JobRole();

        jobRole.setJobRoleName(
                request.getJobRoleName());

        jobRole.setDescription(
                request.getDescription());

        jobRole = jobRoleRepository.save(jobRole);

        return buildResponse(jobRole);
    }

    @Override
    public List<JobRoleResponseDTO>
            getAllJobRoles() {

        List<JobRole> jobRoles =
                jobRoleRepository.findAll();

        List<JobRoleResponseDTO> response =
                new ArrayList<>();

        for (JobRole jobRole : jobRoles) {

            response.add(
                    buildResponse(jobRole));
        }

        return response;
    }

    @Override
    public JobRoleResponseDTO getJobRoleById(
            Long jobRoleId) {

        JobRole jobRole =
                jobRoleRepository.findById(jobRoleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job Role not found."));

        return buildResponse(jobRole);
    }

    @Override
    public JobRoleResponseDTO updateJobRole(
            Long jobRoleId,
            CreateJobRoleRequestDTO request) {

        JobRole jobRole =
                jobRoleRepository.findById(jobRoleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job Role not found."));

        jobRole.setJobRoleName(
                request.getJobRoleName());

        jobRole.setDescription(
                request.getDescription());

        jobRole = jobRoleRepository.save(jobRole);

        return buildResponse(jobRole);
    }

    @Override
    public void deleteJobRole(
            Long jobRoleId) {

        JobRole jobRole =
                jobRoleRepository.findById(jobRoleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job Role not found."));

        jobRoleRepository.delete(jobRole);
    }

    private JobRoleResponseDTO buildResponse(
            JobRole jobRole) {

        JobRoleResponseDTO response =
                new JobRoleResponseDTO();

        response.setJobRoleId(
                jobRole.getJobRoleId());

        response.setJobRoleName(
                jobRole.getJobRoleName());

        response.setDescription(
                jobRole.getDescription());

        return response;
    }

}