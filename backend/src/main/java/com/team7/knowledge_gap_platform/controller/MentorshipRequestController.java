package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.MentorshipRequest;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.team7.knowledge_gap_platform.repository.MentorshipRequestRepository;

@RestController
@RequestMapping("/mentorship-requests")
public class MentorshipRequestController {

    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public MentorshipRequestController(
            MentorshipRequestRepository mentorshipRequestRepository,
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository) {
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
    }

    private int getProficiencyRank(String level) {
        if (level == null) return 0;
        switch (level.trim().toUpperCase()) {
            case "EXPERT": return 4;
            case "ADVANCED": return 3;
            case "INTERMEDIATE": return 2;
            case "BEGINNER": return 1;
            default: return 0;
        }
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorshipRequest>> getRequestsForMentor(@PathVariable Long mentorId) {
        List<MentorshipRequest> list = mentorshipRequestRepository.findByMentorId(mentorId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/mentee/{menteeId}")
    public ResponseEntity<List<MentorshipRequest>> getRequestsForMentee(@PathVariable Long menteeId) {
        List<MentorshipRequest> list = mentorshipRequestRepository.findByMenteeId(menteeId);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> sendRequest(@RequestBody MentorshipRequest req) {
        try {
            Long menteeId = req.getMenteeId();
            Long targetId = req.getMentorId();

            if (menteeId != null && targetId != null) {
                // Prevent self-request
                if (menteeId.equals(targetId)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "You cannot send a mentorship request to yourself."));
                }

                com.team7.knowledge_gap_platform.entity.Employee targetEmp = employeeRepository.findById(targetId).orElse(null);
                if (targetEmp != null) {
                    String role = targetEmp.getRole();
                    // Rule 1: Employees cannot send requests to formal mentors, managers, or admins
                    if (role != null && ("MENTOR".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role) ||
                            "ADMIN".equalsIgnoreCase(role) || "HR".equalsIgnoreCase(role) ||
                            "LEARNING_DEVELOPMENT_ADMIN".equalsIgnoreCase(role))) {
                        return ResponseEntity.badRequest().body(Map.of("message",
                                "Formal mentors and managers are assigned by L&D Admin or Manager. Mentorship requests can only be sent to eligible peer employees."));
                    }

                    // Rule 2: Employee can only send requests to peer employees who have a higher skill level
                    List<com.team7.knowledge_gap_platform.entity.EmployeeSkill> menteeSkills = employeeSkillRepository.findByEmployeeId(menteeId);
                    java.util.Map<Long, Integer> menteeProficiency = new java.util.HashMap<>();
                    for (com.team7.knowledge_gap_platform.entity.EmployeeSkill es : menteeSkills) {
                        menteeProficiency.put(es.getSkillId(), getProficiencyRank(es.getProficiencyLevel()));
                    }

                    List<com.team7.knowledge_gap_platform.entity.EmployeeSkill> targetSkills = employeeSkillRepository.findByEmployeeId(targetId);
                    boolean hasHigherSkill = false;
                    for (com.team7.knowledge_gap_platform.entity.EmployeeSkill ts : targetSkills) {
                        int targetRank = getProficiencyRank(ts.getProficiencyLevel());
                        int menteeRank = menteeProficiency.getOrDefault(ts.getSkillId(), 0);
                        if (targetRank > menteeRank) {
                            hasHigherSkill = true;
                            break;
                        }
                    }

                    if (!hasHigherSkill) {
                        return ResponseEntity.badRequest().body(Map.of("message",
                                "Mentorship requests can only be sent to peer employees who have a higher skill level in the competency."));
                    }
                }
            }
        } catch (Exception ignored) {
        }

        req.setStatus("PENDING");
        req.setCreatedAt(LocalDateTime.now());
        req.setUpdatedAt(LocalDateTime.now());
        MentorshipRequest saved = mentorshipRequestRepository.save(req);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{requestId}/accept")
    public ResponseEntity<MentorshipRequest> acceptRequest(@PathVariable Long requestId) {
        return mentorshipRequestRepository.findById(requestId).map(req -> {
            req.setStatus("ACCEPTED");
            req.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(mentorshipRequestRepository.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<MentorshipRequest> rejectRequest(@PathVariable Long requestId) {
        return mentorshipRequestRepository.findById(requestId).map(req -> {
            req.setStatus("REJECTED");
            req.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(mentorshipRequestRepository.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<MentorshipRequest> cancelRequest(@PathVariable Long requestId) {
        return mentorshipRequestRepository.findById(requestId).map(req -> {
            req.setStatus("CANCELLED");
            req.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(mentorshipRequestRepository.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }
}
