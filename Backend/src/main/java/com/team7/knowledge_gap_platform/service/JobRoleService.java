package com.team7.knowledge_gap_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.JobRole;
import com.team7.knowledge_gap_platform.repository.JobRoleRepository;

@Service
public class JobRoleService {

    @Autowired
    private JobRoleRepository jobRoleRepository;

    public JobRole saveJobRole(JobRole jobRole) {
        return jobRoleRepository.save(jobRole);
    }

    public List<JobRole> getAllJobRoles() {
        return jobRoleRepository.findAll();
    }

    public Optional<JobRole> getJobRoleById(Long id) {
        return jobRoleRepository.findById(id);
    }

    public JobRole updateJobRole(Long id, JobRole jobRole) {

        JobRole existingJobRole = jobRoleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Role not found"));

        existingJobRole.setRoleName(jobRole.getRoleName());
        existingJobRole.setDescription(jobRole.getDescription());
        existingJobRole.setDepartmentName(jobRole.getDepartmentName());

        return jobRoleRepository.save(existingJobRole);
    }

    public void deleteJobRole(Long id) {
        jobRoleRepository.deleteById(id);
    }
}