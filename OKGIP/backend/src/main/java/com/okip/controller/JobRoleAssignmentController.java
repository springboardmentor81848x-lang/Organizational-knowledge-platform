package com.okip.controller;

import java.util.List;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.jobroleassignment.AssignJobRoleRequestDTO;
import com.okip.dto.jobroleassignment.JobRoleAssignmentResponseDTO;
import com.okip.service.jobroleassignment.JobRoleAssignmentService;
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/job-role-assignment")
public class JobRoleAssignmentController {

    private final JobRoleAssignmentService jobRoleAssignmentService;

    public JobRoleAssignmentController(
            JobRoleAssignmentService jobRoleAssignmentService) {

        this.jobRoleAssignmentService = jobRoleAssignmentService;
    }

    @PostMapping
    public ResponseEntity<JobRoleAssignmentResponseDTO> assignJobRole(
            @RequestBody AssignJobRoleRequestDTO request) {

        JobRoleAssignmentResponseDTO response =
                jobRoleAssignmentService.assignJobRole(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<JobRoleAssignmentResponseDTO>>
            getMyAssignedRoles() {

        return ResponseEntity.ok(
                jobRoleAssignmentService.getMyAssignedRoles());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<JobRoleAssignmentResponseDTO>>
            getEmployeeAssignedRoles(
                    @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                jobRoleAssignmentService
                        .getEmployeeAssignedRoles(employeeId));
    }

    @PutMapping("/{employeeJobRoleId}")
    public ResponseEntity<JobRoleAssignmentResponseDTO>
            updateAssignment(
                    @PathVariable Long employeeJobRoleId,
                    @RequestBody AssignJobRoleRequestDTO request) {

        return ResponseEntity.ok(
                jobRoleAssignmentService.updateAssignment(
                        employeeJobRoleId,
                        request));
    }

    @DeleteMapping("/{employeeJobRoleId}")
    public ResponseEntity<String> deleteAssignment(
            @PathVariable Long employeeJobRoleId) {

        jobRoleAssignmentService.deleteAssignment(
                employeeJobRoleId);

        return ResponseEntity.ok(
                "Job Role Assignment deleted successfully.");
    }

}