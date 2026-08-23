package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.team7.knowledge_gap_platform.dto.MentorAssignmentRequest;
import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.entity.MentorAssignment;
import com.team7.knowledge_gap_platform.entity.MentorProfile;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.repository.MentorAssignmentRepository;
import com.team7.knowledge_gap_platform.repository.MentorProfileRepository;

@Service
public class MentorAssignmentService {

    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final EmployeeRepository employeeRepository;

    public MentorAssignmentService(
            MentorAssignmentRepository mentorAssignmentRepository,
            MentorProfileRepository mentorProfileRepository,
            EmployeeRepository employeeRepository) {

        this.mentorAssignmentRepository = mentorAssignmentRepository;
        this.mentorProfileRepository = mentorProfileRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // CREATE MENTOR ASSIGNMENT
    // =========================================================

    public MentorAssignment createAssignment(
            MentorAssignmentRequest request) {

        if (request.getEmployeeId() == null
                || request.getMentorId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "employeeId and mentorId are required");
        }

        // Validate employee receiving mentor
        Employee employee =
                employeeRepository
                        .findById(request.getEmployeeId())
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Employee not found"));

        // Validate selected mentor has MentorProfile
        MentorProfile mentorProfile =
                mentorProfileRepository
                        .findByEmployeeId(request.getMentorId())
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Selected employee is not an eligible mentor"));

        // Prevent assigning employee to themselves
        if (employee.getId()
                .equals(mentorProfile.getEmployeeId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee cannot be assigned as their own mentor");
        }

        // One ACTIVE mentor per employee
        boolean activeAssignmentExists =
                mentorAssignmentRepository
                        .existsByEmployeeIdAndStatus(
                                request.getEmployeeId(),
                                "ACTIVE");

        if (activeAssignmentExists) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Employee already has an active mentor assignment");
        }

        Long assignedBy =
                getLoggedInEmployeeId();

        MentorAssignment assignment =
                new MentorAssignment();

        assignment.setEmployeeId(
                request.getEmployeeId());

        assignment.setMentorId(
                request.getMentorId());

        assignment.setAssignedBy(
                assignedBy);

        assignment.setAssignedAt(
                LocalDateTime.now());

        assignment.setStatus(
                "ACTIVE");

        return mentorAssignmentRepository
                .save(assignment);
    }

    // =========================================================
    // GET CURRENT MENTOR FOR EMPLOYEE
    // =========================================================

    public MentorAssignment getCurrentAssignmentForEmployee(
            Long employeeId) {

        employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Employee not found"));

        return mentorAssignmentRepository
                .findByEmployeeIdAndStatus(
                        employeeId,
                        "ACTIVE")
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "No active mentor assignment found"));
    }

    // =========================================================
    // GET EMPLOYEES ASSIGNED TO MENTOR
    // =========================================================

    public List<MentorAssignment> getAssignmentsForMentor(
            Long mentorId) {

        mentorProfileRepository
                .findByEmployeeId(mentorId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Mentor not found"));

        return mentorAssignmentRepository
                .findByMentorIdAndStatus(
                        mentorId,
                        "ACTIVE");
    }

    // =========================================================
    // UPDATE / REPLACE ASSIGNED MENTOR
    // =========================================================

    public MentorAssignment updateAssignment(
            Long assignmentId,
            MentorAssignmentRequest request) {

        MentorAssignment existing =
                mentorAssignmentRepository
                        .findById(assignmentId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Mentor assignment not found"));

        if (!"ACTIVE".equalsIgnoreCase(
                existing.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only active mentor assignments can be updated");
        }

        if (request.getMentorId() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "mentorId is required");
        }

        MentorProfile mentorProfile =
                mentorProfileRepository
                        .findByEmployeeId(
                                request.getMentorId())
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Selected employee is not an eligible mentor"));

        Long employeeId =
                existing.getEmployeeId();

        if (employeeId.equals(
                mentorProfile.getEmployeeId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Employee cannot be assigned as their own mentor");
        }

        existing.setMentorId(
                request.getMentorId());

        existing.setAssignedBy(
                getLoggedInEmployeeId());

        existing.setAssignedAt(
                LocalDateTime.now());

        existing.setStatus(
                "ACTIVE");

        return mentorAssignmentRepository
                .save(existing);
    }

    // =========================================================
    // CANCEL ASSIGNMENT
    // =========================================================

    public MentorAssignment cancelAssignment(
            Long assignmentId) {

        MentorAssignment assignment =
                mentorAssignmentRepository
                        .findById(assignmentId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Mentor assignment not found"));

        if ("CANCELLED".equalsIgnoreCase(
                assignment.getStatus())) {

            return assignment;
        }

        assignment.setStatus(
                "CANCELLED");

        return mentorAssignmentRepository
                .save(assignment);
    }

    // =========================================================
    // GET ASSIGNMENT HISTORY FOR EMPLOYEE
    // =========================================================

    public List<MentorAssignment> getAssignmentHistory(
            Long employeeId) {

        return mentorAssignmentRepository
                .findByEmployeeId(
                        employeeId);
    }

    // =========================================================
    // GET LOGGED-IN EMPLOYEE FROM JWT
    // =========================================================

    private Long getLoggedInEmployeeId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User is not authenticated");
        }

        String email =
                authentication.getName();

        return employeeRepository
                .findByEmail(email)
                .map(Employee::getId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Logged-in user does not have an employee record"));
    }
}