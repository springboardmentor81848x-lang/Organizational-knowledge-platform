package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.JobRole;
import com.team7.knowledge_gap_platform.service.JobRoleService;

@RestController
@RequestMapping("/job-roles")
public class JobRoleController {

    @Autowired
    private JobRoleService jobRoleService;

    @PostMapping
    public JobRole saveJobRole(@RequestBody JobRole jobRole) {
        return jobRoleService.saveJobRole(jobRole);
    }

    @GetMapping
    public List<JobRole> getAllJobRoles() {
        return jobRoleService.getAllJobRoles();
    }

    @GetMapping("/{id}")
    public Optional<JobRole> getJobRoleById(@PathVariable Long id) {
        return jobRoleService.getJobRoleById(id);
    }

    @PutMapping("/{id}")
    public JobRole updateJobRole(
            @PathVariable Long id,
            @RequestBody JobRole jobRole) {

        return jobRoleService.updateJobRole(id, jobRole);
    }

    @DeleteMapping("/{id}")
    public String deleteJobRole(@PathVariable Long id) {
        jobRoleService.deleteJobRole(id);
        return "Job role deleted successfully!";
    }
}
