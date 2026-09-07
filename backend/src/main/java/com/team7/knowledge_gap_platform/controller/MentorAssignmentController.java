package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.MentorAssignment;
import com.team7.knowledge_gap_platform.repository.MentorAssignmentRepository;

@RestController
@RequestMapping("/mentor-assignments")
public class MentorAssignmentController {

    private final MentorAssignmentRepository mentorAssignmentRepository;

    public MentorAssignmentController(MentorAssignmentRepository mentorAssignmentRepository) {
        this.mentorAssignmentRepository = mentorAssignmentRepository;
    }

    @PostMapping
    public ResponseEntity<MentorAssignment> createAssignment(@RequestBody MentorAssignment assignment) {
        if (assignment.getAssignedAt() == null) {
            assignment.setAssignedAt(LocalDateTime.now());
        }
        if (assignment.getStatus() == null) {
            assignment.setStatus("ACTIVE");
        }
        return ResponseEntity.ok(mentorAssignmentRepository.save(assignment));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<MentorAssignment> getCurrentAssignmentForEmployee(@PathVariable Long employeeId) {
        return mentorAssignmentRepository.findFirstByEmployeeIdOrderByAssignedAtDesc(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorAssignment>> getAssignmentsForMentor(@PathVariable Long mentorId) {
        List<MentorAssignment> list = mentorAssignmentRepository.findByMentorId(mentorId);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{assignmentId}")
    public ResponseEntity<MentorAssignment> updateAssignment(
            @PathVariable Long assignmentId,
            @RequestBody MentorAssignment request) {
        return mentorAssignmentRepository.findById(assignmentId).map(assignment -> {
            if (request.getStatus() != null) assignment.setStatus(request.getStatus());
            if (request.getMentorId() != null) assignment.setMentorId(request.getMentorId());
            return ResponseEntity.ok(mentorAssignmentRepository.save(assignment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<MentorAssignment> cancelAssignment(@PathVariable Long assignmentId) {
        return mentorAssignmentRepository.findById(assignmentId).map(assignment -> {
            assignment.setStatus("CANCELLED");
            return ResponseEntity.ok(mentorAssignmentRepository.save(assignment));
        }).orElse(ResponseEntity.notFound().build());
    }
}
