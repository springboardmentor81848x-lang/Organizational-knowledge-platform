package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.dto.MentorAssignmentRequest;
import com.team7.knowledge_gap_platform.entity.MentorAssignment;
import com.team7.knowledge_gap_platform.service.MentorAssignmentService;

@RestController
@RequestMapping("/mentor-assignments")
public class MentorAssignmentController {

    private final MentorAssignmentService mentorAssignmentService;

    public MentorAssignmentController(
            MentorAssignmentService mentorAssignmentService) {

        this.mentorAssignmentService =
                mentorAssignmentService;
    }

    // =========================================================
    // CREATE ASSIGNMENT
    // =========================================================

    @PostMapping
    public ResponseEntity<MentorAssignment> createAssignment(
            @RequestBody MentorAssignmentRequest request) {

        MentorAssignment assignment =
                mentorAssignmentService
                        .createAssignment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(assignment);
    }

    // =========================================================
    // CURRENT MENTOR FOR EMPLOYEE
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<MentorAssignment>
    getCurrentAssignmentForEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                mentorAssignmentService
                        .getCurrentAssignmentForEmployee(
                                employeeId));
    }

    // =========================================================
    // EMPLOYEES ASSIGNED TO MENTOR
    // =========================================================

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorAssignment>>
    getAssignmentsForMentor(
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                mentorAssignmentService
                        .getAssignmentsForMentor(
                                mentorId));
    }

    // =========================================================
    // EMPLOYEE ASSIGNMENT HISTORY
    // =========================================================

    @GetMapping("/employee/{employeeId}/history")
    public ResponseEntity<List<MentorAssignment>>
    getAssignmentHistory(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                mentorAssignmentService
                        .getAssignmentHistory(
                                employeeId));
    }

    // =========================================================
    // CHANGE / REPLACE MENTOR
    // =========================================================

    @PutMapping("/{assignmentId}")
    public ResponseEntity<MentorAssignment>
    updateAssignment(
            @PathVariable Long assignmentId,
            @RequestBody MentorAssignmentRequest request) {

        return ResponseEntity.ok(
                mentorAssignmentService
                        .updateAssignment(
                                assignmentId,
                                request));
    }

    // =========================================================
    // CANCEL ASSIGNMENT
    // =========================================================

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<MentorAssignment>
    cancelAssignment(
            @PathVariable Long assignmentId) {

        return ResponseEntity.ok(
                mentorAssignmentService
                        .cancelAssignment(
                                assignmentId));
    }
}