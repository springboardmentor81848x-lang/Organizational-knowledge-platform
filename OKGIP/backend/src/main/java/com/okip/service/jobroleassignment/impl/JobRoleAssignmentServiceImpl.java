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
@Transactional
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

    /*
     * ============================================================
     * INITIALIZE REQUIRED SKILLS
     * ============================================================
     *
     * When a job role is assigned, all skills defined in the
     * JobRoleCompetency table are added to the employee's
     * Skill Profile if they do not already exist.
     *
     * IMPORTANT:
     * Existing employee skill proficiency is NEVER overwritten.
     *
     * Example:
     *
     * Existing:
     * Java = INTERMEDIATE
     *
     * Assigned role requires:
     * Java = ADVANCED
     *
     * Result:
     * Java remains INTERMEDIATE.
     *
     * Gap Analysis will later compare:
     * INTERMEDIATE vs ADVANCED.
     * ============================================================
     */

    private void initializeRequiredSkills(
            Employee employee,
            JobRole jobRole) {

        List<JobRoleCompetency> competencies =
                jobRoleCompetencyRepository.findByJobRole(jobRole);

        if (competencies == null || competencies.isEmpty()) {
            return;
        }

        for (JobRoleCompetency competency : competencies) {

            if (competency == null) {
                continue;
            }

            Skill skill = competency.getSkill();

            if (skill == null) {
                continue;
            }

            boolean alreadyExists =
                    employeeSkillRepository
                            .findByEmployeeAndSkill(
                                    employee,
                                    skill)
                            .isPresent();

            /*
             * Do not overwrite existing employee skill.
             */
            if (alreadyExists) {
                continue;
            }

            EmployeeSkill employeeSkill =
                    new EmployeeSkill();

            employeeSkill.setEmployee(employee);
            employeeSkill.setSkill(skill);

            /*
             * A newly required skill starts at BEGINNER.
             * Assessment can update this later.
             */
            employeeSkill.setProficiencyLevel(
                    ProficiencyLevel.BEGINNER);

            employeeSkill.setYearsOfExperience(0.0);

            employeeSkillRepository.save(employeeSkill);
        }
    }

    /*
     * ============================================================
     * HR / MANAGER / ADMIN ASSIGN JOB ROLE
     * ============================================================
     */

    @Override
    public JobRoleAssignmentResponseDTO assignJobRole(
            AssignJobRoleRequestDTO request) {

        if (request == null) {
            throw new ResourceNotFoundException(
                    "Job role assignment request is required.");
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

        /*
         * Prevent duplicate active assignment of the same role.
         */
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

        /*
         * Only one PRIMARY role is allowed.
         *
         * If another PRIMARY role exists,
         * convert it to SECONDARY.
         */
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

        Employee assignedBy =
                getLoggedInEmployee();

        EmployeeJobRole assignment =
                new EmployeeJobRole();

        assignment.setEmployee(employee);
        assignment.setJobRole(jobRole);

        assignment.setAssignmentType(
                request.getAssignmentType());

        assignment.setAssignedBy(assignedBy);

        assignment.setAssignedDate(
                LocalDate.now());

        assignment.setActive(true);

        /*
         * Save assignment first.
         */
        assignment =
                employeeJobRoleRepository.save(
                        assignment);

        /*
         * IMPORTANT:
         *
         * Load all required skills dynamically from
         * JobRoleCompetency.
         *
         * No role IDs are hardcoded here.
         */
        initializeRequiredSkills(
                employee,
                jobRole);

        return buildResponse(assignment);
    }

    /*
     * ============================================================
     * GET MY ACTIVE JOB ROLES
     * ============================================================
     */

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

        for (EmployeeJobRole assignment :
                assignments) {

            response.add(
                    buildResponse(assignment));
        }

        return response;
    }

    /*
     * ============================================================
     * GET EMPLOYEE ACTIVE JOB ROLES
     * ============================================================
     */

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

        for (EmployeeJobRole assignment :
                assignments) {

            response.add(
                    buildResponse(assignment));
        }

        return response;
    }

    /*
     * ============================================================
     * UPDATE JOB ROLE ASSIGNMENT
     * ============================================================
     */

    @Override
    public JobRoleAssignmentResponseDTO updateAssignment(
            Long employeeJobRoleId,
            AssignJobRoleRequestDTO request) {

        EmployeeJobRole assignment =
                employeeJobRoleRepository
                        .findById(employeeJobRoleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assignment not found."));

        JobRole jobRole =
                jobRoleRepository
                        .findById(request.getJobRoleId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Job Role not found."));

        /*
         * If changing to PRIMARY,
         * demote existing PRIMARY role.
         */
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

        /*
         * Make sure the newly selected role's required
         * skills exist in the employee Skill Profile.
         */
        initializeRequiredSkills(
                assignment.getEmployee(),
                jobRole);

        return buildResponse(assignment);
    }

    /*
     * ============================================================
     * DELETE JOB ROLE ASSIGNMENT
     * ============================================================
     */

    @Override
    public void deleteAssignment(
            Long employeeJobRoleId) {

        EmployeeJobRole assignment =
                employeeJobRoleRepository
                        .findById(employeeJobRoleId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assignment not found."));

        /*
         * Soft deactivate instead of deleting the record.
         *
         * This preserves assignment history.
         */
        assignment.setActive(false);

        employeeJobRoleRepository.save(
                assignment);
    }

    /*
     * ============================================================
     * EMPLOYEE SELF ROLE ASSIGNMENT
     * ============================================================
     */

    @Override
    public JobRoleAssignmentResponseDTO assignMyRole(
            AssignJobRoleRequestDTO request) {

        Employee employee =
                getLoggedInEmployee();

        JobRole jobRole =
                jobRoleRepository
                        .findById(request.getJobRoleId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Job Role not found."));

        /*
         * Prevent duplicate active role.
         */
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

        /*
         * Maintain one PRIMARY role.
         */
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

        EmployeeJobRole assignment =
                new EmployeeJobRole();

        assignment.setEmployee(employee);

        assignment.setJobRole(jobRole);

        assignment.setAssignmentType(
                request.getAssignmentType());

        /*
         * Employee selected the role themselves.
         */
        assignment.setAssignedBy(employee);

        assignment.setAssignedDate(
                LocalDate.now());

        assignment.setActive(true);

        assignment =
                employeeJobRoleRepository.save(
                        assignment);

        /*
         * Automatically initialise the required skills.
         */
        initializeRequiredSkills(
                employee,
                jobRole);

        return buildResponse(assignment);
    }

    /*
     * ============================================================
     * GET LOGGED-IN EMPLOYEE
     * ============================================================
     */

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

    /*
     * ============================================================
     * BUILD RESPONSE
     * ============================================================
     */

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

        if (assignment.getAssignedBy() != null) {

            response.setAssignedBy(
                    assignment.getAssignedBy()
                            .getEmployeeCode());

        } else {

            response.setAssignedBy(null);
        }

        response.setAssignedDate(
                assignment.getAssignedDate());

        response.setActive(
                assignment.getActive());

        return response;
    }
}