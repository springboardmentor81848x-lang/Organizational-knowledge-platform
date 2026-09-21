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
import com.okip.entity.master.Skill;

import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.JobRoleCompetency;

import com.okip.enums.AssignmentType;
import com.okip.enums.ProficiencyLevel;

import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;

import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.JobRoleCompetencyRepository;
import com.okip.repository.JobRoleRepository;

import com.okip.service.jobroleassignment.JobRoleAssignmentService;

@Service
public class JobRoleAssignmentServiceImpl
        implements JobRoleAssignmentService {

    private final EmployeeRepository employeeRepository;
    private final JobRoleRepository jobRoleRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;
    private final JobRoleCompetencyRepository jobRoleCompetencyRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public JobRoleAssignmentServiceImpl(
            EmployeeRepository employeeRepository,
            JobRoleRepository jobRoleRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            JobRoleCompetencyRepository jobRoleCompetencyRepository,
            EmployeeSkillRepository employeeSkillRepository) {

        this.employeeRepository = employeeRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.jobRoleCompetencyRepository = jobRoleCompetencyRepository;
        this.employeeSkillRepository = employeeSkillRepository;
    }

    // ============================================================
    // INITIALIZE REQUIRED SKILLS FOR JOB ROLE
    // ============================================================

    private void initializeRequiredSkills(
            Employee employee,
            JobRole jobRole) {

        List<JobRoleCompetency> competencies =
                jobRoleCompetencyRepository.findByJobRole(jobRole);

        for (JobRoleCompetency competency : competencies) {

            Skill skill = competency.getSkill();

            if (skill == null) {
                continue;
            }

            boolean alreadyExists =
                    employeeSkillRepository
                            .findByEmployeeAndSkill(employee, skill)
                            .isPresent();

            /*
             * Do not overwrite an existing employee skill.
             *
             * If the employee already has:
             * Java -> INTERMEDIATE
             *
             * keep it.
             *
             * Only create missing required skills.
             */
            if (!alreadyExists) {

                EmployeeSkill employeeSkill =
                        new EmployeeSkill();

                employeeSkill.setEmployee(employee);
                employeeSkill.setSkill(skill);

                /*
                 * Newly required skill starts at BEGINNER.
                 * Assessment will update this later.
                 */
                employeeSkill.setProficiencyLevel(
                        ProficiencyLevel.BEGINNER);

                employeeSkill.setYearsOfExperience(0.0);

                employeeSkillRepository.save(employeeSkill);
            }
        }
    }

    // ============================================================
    // HR / MANAGER / ADMIN ASSIGN JOB ROLE
    // ============================================================

    @Override
    @Transactional
    public JobRoleAssignmentResponseDTO assignJobRole(
            AssignJobRoleRequestDTO request) {

        if (request == null
                || request.getEmployeeId() == null
                || request.getJobRoleId() == null
                || request.getAssignmentType() == null) {

            throw new IllegalArgumentException(
                    "Employee ID, Job Role ID and Assignment Type are required.");
        }

        Employee employee =
                employeeRepository
                        .findById(request.getEmployeeId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found."));

        JobRole jobRole =
                jobRoleRepository
                        .findById(request.getJobRoleId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Job Role not found."));

        // --------------------------------------------------------
        // Prevent duplicate active assignment
        // --------------------------------------------------------

        var existingAssignment =
                employeeJobRoleRepository
                        .findByEmployeeAndJobRoleAndActiveTrue(
                                employee,
                                jobRole);

        if (existingAssignment.isPresent()) {

            EmployeeJobRole existing =
                    existingAssignment.get();

            String type =
                    existing.getAssignmentType() == null
                            ? "ACTIVE"
                            : existing.getAssignmentType().name();

            String owner =
                    existing.getAssignedBy() == null
                            ? "another assignment"
                            : existing.getAssignedBy()
                                    .getEmployeeCode();

            throw new ResourceAlreadyExistsException(
                    jobRole.getJobRoleName()
                            + " is already assigned to "
                            + employee.getFirstName()
                            + " "
                            + employee.getLastName()
                            + " as "
                            + type
                            + " (owner: "
                            + owner
                            + "). Choose a different job role.");
        }

        // --------------------------------------------------------
        // Only one PRIMARY role
        // --------------------------------------------------------

        if (request.getAssignmentType()
                == AssignmentType.PRIMARY) {

            employeeJobRoleRepository
                    .findByEmployeeAndAssignmentTypeAndActiveTrue(
                            employee,
                            AssignmentType.PRIMARY)
                    .ifPresent(existingPrimary -> {

                        existingPrimary.setAssignmentType(
                                AssignmentType.SECONDARY);

                        employeeJobRoleRepository.save(
                                existingPrimary);
                    });
        }

        // --------------------------------------------------------
        // Logged-in HR / Manager / Admin
        // --------------------------------------------------------

        Employee assignedBy =
                getLoggedInEmployee();

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
                employeeJobRoleRepository.save(
                        assignment);

        // --------------------------------------------------------
        // IMPORTANT:
        // Add job-role-required skills to employee profile
        // --------------------------------------------------------

        initializeRequiredSkills(
                employee,
                jobRole);

        return buildResponse(assignment);
    }

    // ============================================================
    // EMPLOYEE SELF ROLE ASSIGNMENT
    // ============================================================

    @Override
    @Transactional
    public JobRoleAssignmentResponseDTO assignMyRole(
            AssignJobRoleRequestDTO request) {

        if (request == null
                || request.getJobRoleId() == null
                || request.getAssignmentType() == null) {

            throw new IllegalArgumentException(
                    "Job Role ID and Assignment Type are required.");
        }

        // --------------------------------------------------------
        // IMPORTANT:
        // Never take employeeId from request.
        // Get employee from logged-in JWT.
        // --------------------------------------------------------

        Employee employee =
                getLoggedInEmployee();

        JobRole jobRole =
                jobRoleRepository
                        .findById(request.getJobRoleId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Job Role not found."));

        // --------------------------------------------------------
        // Prevent duplicate active assignment
        // --------------------------------------------------------

        var existingAssignment =
                employeeJobRoleRepository
                        .findByEmployeeAndJobRoleAndActiveTrue(
                                employee,
                                jobRole);

        if (existingAssignment.isPresent()) {

            throw new ResourceAlreadyExistsException(
                    jobRole.getJobRoleName()
                            + " is already assigned to you.");
        }

        // --------------------------------------------------------
        // Only one PRIMARY role
        // --------------------------------------------------------

        if (request.getAssignmentType()
                == AssignmentType.PRIMARY) {

            employeeJobRoleRepository
                    .findByEmployeeAndAssignmentTypeAndActiveTrue(
                            employee,
                            AssignmentType.PRIMARY)
                    .ifPresent(existingPrimary -> {

                        existingPrimary.setAssignmentType(
                                AssignmentType.SECONDARY);

                        employeeJobRoleRepository.save(
                                existingPrimary);
                    });
        }

        // --------------------------------------------------------
        // Create employee's own role assignment
        // --------------------------------------------------------

        EmployeeJobRole assignment =
                new EmployeeJobRole();

        assignment.setEmployee(employee);
        assignment.setJobRole(jobRole);

        assignment.setAssignmentType(
                request.getAssignmentType());

        /*
         * Since employee selected the role themselves,
         * employee becomes assignedBy.
         */
        assignment.setAssignedBy(employee);

        assignment.setAssignedDate(
                LocalDate.now());

        assignment.setActive(true);

        assignment =
                employeeJobRoleRepository.save(
                        assignment);

        // --------------------------------------------------------
        // Initialize required skills
        // --------------------------------------------------------

        initializeRequiredSkills(
                employee,
                jobRole);

        return buildResponse(assignment);
    }

    // ============================================================
    // GET MY ACTIVE ROLES
    // ============================================================

    @Override
    public List<JobRoleAssignmentResponseDTO>
            getMyAssignedRoles() {

        Employee employee =
                getLoggedInEmployee();

        List<EmployeeJobRole> assignments =
                employeeJobRoleRepository
                        .findByEmployeeAndActiveTrue(
                                employee);

        List<JobRoleAssignmentResponseDTO> response =
                new ArrayList<>();

        for (EmployeeJobRole assignment
                : assignments) {

            response.add(
                    buildResponse(assignment));
        }

        return response;
    }

    // ============================================================
    // GET EMPLOYEE ACTIVE ROLES
    // ============================================================

    @Override
    public List<JobRoleAssignmentResponseDTO>
            getEmployeeAssignedRoles(
                    Long employeeId) {

        Employee employee =
                employeeRepository
                        .findById(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Employee not found."));

        List<EmployeeJobRole> assignments =
                employeeJobRoleRepository
                        .findByEmployeeAndActiveTrue(
                                employee);

        List<JobRoleAssignmentResponseDTO> response =
                new ArrayList<>();

        for (EmployeeJobRole assignment
                : assignments) {

            response.add(
                    buildResponse(assignment));
        }

        return response;
    }

    // ============================================================
    // UPDATE JOB ROLE ASSIGNMENT
    // ============================================================

    @Override
    @Transactional
    public JobRoleAssignmentResponseDTO updateAssignment(
            Long employeeJobRoleId,
            AssignJobRoleRequestDTO request) {

        if (request == null
                || request.getJobRoleId() == null
                || request.getAssignmentType() == null) {

            throw new IllegalArgumentException(
                    "Job Role ID and Assignment Type are required.");
        }

        EmployeeJobRole assignment =
                employeeJobRoleRepository
                        .findById(employeeJobRoleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assignment not found."));

        JobRole oldJobRole =
                assignment.getJobRole();

        JobRole jobRole =
                jobRoleRepository
                        .findById(request.getJobRoleId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Job Role not found."));

        // --------------------------------------------------------
        // Only one PRIMARY role
        // --------------------------------------------------------

        if (request.getAssignmentType()
                == AssignmentType.PRIMARY) {

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

                            employeeJobRoleRepository.save(
                                    existingPrimary);
                        }
                    });
        }

        assignment.setJobRole(jobRole);

        assignment.setAssignmentType(
                request.getAssignmentType());

        assignment =
                employeeJobRoleRepository.save(
                        assignment);

        // --------------------------------------------------------
        // Add newly required skills
        // --------------------------------------------------------

        initializeRequiredSkills(
                assignment.getEmployee(),
                jobRole);

        return buildResponse(assignment);
    }

    // ============================================================
    // DELETE JOB ROLE ASSIGNMENT
    // ============================================================

    @Override
    @Transactional
    public void deleteAssignment(
            Long employeeJobRoleId) {

        EmployeeJobRole assignment =
                employeeJobRoleRepository
                        .findById(employeeJobRoleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assignment not found."));

        employeeJobRoleRepository.delete(
                assignment);
    }

    // ============================================================
    // GET LOGGED-IN EMPLOYEE
    // ============================================================

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new ResourceNotFoundException(
                    "Authenticated employee not found.");
        }

        String email =
                authentication.getName();

        return employeeRepository
                .findByOfficialEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));
    }

    // ============================================================
    // BUILD RESPONSE
    // ============================================================

    private JobRoleAssignmentResponseDTO buildResponse(
            EmployeeJobRole assignment) {

        JobRoleAssignmentResponseDTO response =
                new JobRoleAssignmentResponseDTO();

        response.setEmployeeJobRoleId(
                assignment.getEmployeeJobRoleId());

        response.setEmployeeCode(
                assignment.getEmployee()
                        .getEmployeeCode());

        response.setEmployeeName(
                assignment.getEmployee()
                        .getFirstName()
                        + " "
                        + assignment.getEmployee()
                                .getLastName());

        response.setJobRoleId(
                assignment.getJobRole()
                        .getJobRoleId());

        response.setJobRoleName(
                assignment.getJobRole()
                        .getJobRoleName());

        response.setAssignmentType(
                assignment.getAssignmentType());

        response.setAssignedBy(
                assignment.getAssignedBy()
                        .getEmployeeCode());

        response.setAssignedDate(
                assignment.getAssignedDate());

        response.setActive(
                assignment.getActive());

        return response;
    }
}