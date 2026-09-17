package com.okip.service.jobroleassignment.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.jobroleassignment.AssignJobRoleRequestDTO;
import com.okip.dto.jobroleassignment.JobRoleAssignmentResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.JobRole;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.enums.AssignmentType;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.JobRoleRepository;
import com.okip.service.jobroleassignment.JobRoleAssignmentService;

@Service
public class JobRoleAssignmentServiceImpl
        implements JobRoleAssignmentService {

    private final EmployeeRepository employeeRepository;
    private final JobRoleRepository jobRoleRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;

    public JobRoleAssignmentServiceImpl(
            EmployeeRepository employeeRepository,
            JobRoleRepository jobRoleRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository) {

        this.employeeRepository = employeeRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
    }

    @Override
    @Transactional
    public JobRoleAssignmentResponseDTO assignJobRole(
            AssignJobRoleRequestDTO request) {

        Employee employee =
                employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));

        JobRole jobRole =
                jobRoleRepository.findById(request.getJobRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job Role not found."));

        var existingAssignment = employeeJobRoleRepository
                .findByEmployeeAndJobRoleAndActiveTrue(employee, jobRole);

        if (existingAssignment.isPresent()) {
            EmployeeJobRole existing = existingAssignment.get();
            String type = existing.getAssignmentType() == null
                    ? "ACTIVE"
                    : existing.getAssignmentType().name();
            String owner = existing.getAssignedBy() == null
                    ? "another assignment"
                    : existing.getAssignedBy().getEmployeeCode();
            throw new ResourceAlreadyExistsException(
                    jobRole.getJobRoleName() + " is already assigned to "
                            + employee.getFirstName() + " " + employee.getLastName()
                            + " as " + type + " (owner: " + owner + "). Choose a different job role.");
        }

        if (request.getAssignmentType() == AssignmentType.PRIMARY) {

            employeeJobRoleRepository
                    .findByEmployeeAndAssignmentTypeAndActiveTrue(
                            employee,
                            AssignmentType.PRIMARY)
                    .ifPresent(existingPrimary -> {

                        existingPrimary.setAssignmentType(
                                AssignmentType.SECONDARY);

                        employeeJobRoleRepository.save(existingPrimary);
                    });
        }

        Employee assignedBy = getLoggedInEmployee();

        EmployeeJobRole assignment =
                new EmployeeJobRole();

        assignment.setEmployee(employee);
        assignment.setJobRole(jobRole);
        assignment.setAssignmentType(
                request.getAssignmentType());
        assignment.setAssignedBy(assignedBy);
        assignment.setAssignedDate(LocalDate.now());
        assignment.setActive(true);

        assignment =
                employeeJobRoleRepository.save(assignment);

        return buildResponse(assignment);
    }

    @Override
    public List<JobRoleAssignmentResponseDTO>
            getMyAssignedRoles() {

        Employee employee = getLoggedInEmployee();

        List<EmployeeJobRole> assignments =
                employeeJobRoleRepository
                .findByEmployeeAndActiveTrue(employee);

        List<JobRoleAssignmentResponseDTO> response =
                new ArrayList<>();

        for (EmployeeJobRole assignment : assignments) {

            response.add(buildResponse(assignment));
        }

        return response;
    }

    @Override
    public List<JobRoleAssignmentResponseDTO>
            getEmployeeAssignedRoles(Long employeeId) {

        Employee employee =
                employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));

        List<EmployeeJobRole> assignments =
                employeeJobRoleRepository
                .findByEmployeeAndActiveTrue(employee);

        List<JobRoleAssignmentResponseDTO> response =
                new ArrayList<>();

        for (EmployeeJobRole assignment : assignments) {

            response.add(buildResponse(assignment));
        }

        return response;
    }

    @Override
    public JobRoleAssignmentResponseDTO updateAssignment(
            Long employeeJobRoleId,
            AssignJobRoleRequestDTO request) {

        EmployeeJobRole assignment =
                employeeJobRoleRepository.findById(employeeJobRoleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Assignment not found."));

        JobRole jobRole =
                jobRoleRepository.findById(request.getJobRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Job Role not found."));

        if (request.getAssignmentType() == AssignmentType.PRIMARY) {

            employeeJobRoleRepository
                    .findByEmployeeAndAssignmentTypeAndActiveTrue(
                            assignment.getEmployee(),
                            AssignmentType.PRIMARY)
                    .ifPresent(existingPrimary -> {

                        if (!existingPrimary
                                .getEmployeeJobRoleId()
                                .equals(employeeJobRoleId)) {

                            existingPrimary.setAssignmentType(
                                    AssignmentType.SECONDARY);

                            employeeJobRoleRepository.save(existingPrimary);
                        }
                    });
        }

        assignment.setJobRole(jobRole);
        assignment.setAssignmentType(
                request.getAssignmentType());

        assignment =
                employeeJobRoleRepository.save(assignment);

        return buildResponse(assignment);
    }

    @Override
    public void deleteAssignment(
            Long employeeJobRoleId) {

        EmployeeJobRole assignment =
                employeeJobRoleRepository.findById(employeeJobRoleId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Assignment not found."));

        employeeJobRoleRepository.delete(assignment);
    }

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder
                .getContext()
                .getAuthentication();

        String email = authentication.getName();

        return employeeRepository
                .findByOfficialEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));
    }

    private JobRoleAssignmentResponseDTO buildResponse(
            EmployeeJobRole assignment) {

        JobRoleAssignmentResponseDTO response =
                new JobRoleAssignmentResponseDTO();

        response.setEmployeeJobRoleId(
                assignment.getEmployeeJobRoleId());

        response.setEmployeeCode(
                assignment.getEmployee().getEmployeeCode());

        response.setEmployeeName(
                assignment.getEmployee().getFirstName()
                        + " "
                        + assignment.getEmployee().getLastName());

        response.setJobRoleId(
                assignment.getJobRole().getJobRoleId());

        response.setJobRoleName(
                assignment.getJobRole().getJobRoleName());

        response.setAssignmentType(
                assignment.getAssignmentType());

        response.setAssignedBy(
                assignment.getAssignedBy().getEmployeeCode());

        response.setAssignedDate(
                assignment.getAssignedDate());

        response.setActive(
                assignment.getActive());

        return response;
    }
}