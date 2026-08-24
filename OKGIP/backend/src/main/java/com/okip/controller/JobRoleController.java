package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.jobrole.CreateJobRoleRequestDTO;
import com.okip.dto.jobrole.JobRoleResponseDTO;
import com.okip.service.jobrole.JobRoleService;

@RestController
@RequestMapping("/api/master/job-roles")
public class JobRoleController {

    private final JobRoleService jobRoleService;

    public JobRoleController(
            JobRoleService jobRoleService) {

        this.jobRoleService = jobRoleService;
    }

    @PostMapping
    public ResponseEntity<JobRoleResponseDTO>
            createJobRole(
                    @RequestBody
                    CreateJobRoleRequestDTO request) {

        JobRoleResponseDTO response =
                jobRoleService.createJobRole(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<JobRoleResponseDTO>>
            getAllJobRoles() {

        return ResponseEntity.ok(
                jobRoleService.getAllJobRoles());
    }

    @GetMapping("/{jobRoleId}")
    public ResponseEntity<JobRoleResponseDTO>
            getJobRoleById(
                    @PathVariable Long jobRoleId) {

        return ResponseEntity.ok(
                jobRoleService.getJobRoleById(jobRoleId));
    }

    @PutMapping("/{jobRoleId}")
    public ResponseEntity<JobRoleResponseDTO>
            updateJobRole(
                    @PathVariable Long jobRoleId,
                    @RequestBody
                    CreateJobRoleRequestDTO request) {

        return ResponseEntity.ok(
                jobRoleService.updateJobRole(
                        jobRoleId,
                        request));
    }

    @DeleteMapping("/{jobRoleId}")
    public ResponseEntity<String>
            deleteJobRole(
                    @PathVariable Long jobRoleId) {

        jobRoleService.deleteJobRole(jobRoleId);

        return ResponseEntity.ok(
                "Job Role deleted successfully.");
    }

}