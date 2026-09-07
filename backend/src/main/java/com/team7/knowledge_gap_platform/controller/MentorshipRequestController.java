package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mentorship-requests")
public class MentorshipRequestController {

    private final AtomicLong requestSeq = new AtomicLong(10);
    private final List<Map<String, Object>> requests = new ArrayList<>();
    private final com.team7.knowledge_gap_platform.repository.EmployeeRepository employeeRepository;
    private final com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository employeeSkillRepository;

    public MentorshipRequestController(
            com.team7.knowledge_gap_platform.repository.EmployeeRepository employeeRepository,
            com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository employeeSkillRepository) {
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
    public ResponseEntity<List<Map<String, Object>>> getRequestsForMentor(@PathVariable Long mentorId) {
        List<Map<String, Object>> list = requests.stream()
                .filter(r -> mentorId.equals(Long.valueOf(String.valueOf(r.get("mentorId")))))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/mentee/{menteeId}")
    public ResponseEntity<List<Map<String, Object>>> getRequestsForMentee(@PathVariable Long menteeId) {
        List<Map<String, Object>> list = requests.stream()
                .filter(r -> menteeId.equals(Long.valueOf(String.valueOf(r.get("menteeId")))))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, Object> req) {
        try {
            Long menteeId = Long.valueOf(String.valueOf(req.get("menteeId")));
            Long targetId = Long.valueOf(String.valueOf(req.get("mentorId")));

            // Prevent self-request
            if (menteeId.equals(targetId)) {
                return ResponseEntity.badRequest().body(Map.of("message", "You cannot send a mentorship request to yourself."));
            }

            com.team7.knowledge_gap_platform.entity.Employee targetEmp = employeeRepository.findById(targetId).orElse(null);
            if (targetEmp != null) {
                String role = targetEmp.getRole();
                // Rule 1: Employees cannot send requests to formal mentors, managers, or admins
                // Formal mentors are assigned by L&D Admin or Manager
                if (role != null && ("MENTOR".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role) ||
                        "ADMIN".equalsIgnoreCase(role) || "HR".equalsIgnoreCase(role) ||
                        "LEARNING_DEVELOPMENT_ADMIN".equalsIgnoreCase(role))) {
                    return ResponseEntity.badRequest().body(Map.of("message",
                            "Formal mentors and managers are assigned by L&D Admin or Manager. Mentorship requests can only be sent to eligible peer employees."));
                }

                // Rule 2: Employee can only send requests to peer employees who have a higher skill level
                List<com.team7.knowledge_gap_platform.entity.EmployeeSkill> menteeSkills = employeeSkillRepository.findByEmployeeId(menteeId);
                Map<Long, Integer> menteeProficiency = new java.util.HashMap<>();
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
        } catch (Exception ignored) {
        }

        long id = requestSeq.incrementAndGet();
        req.put("id", id);
        req.put("status", "PENDING");
        req.put("createdAt", LocalDateTime.now().toString());
        requests.add(new ConcurrentHashMap<>(req));
        return ResponseEntity.ok(req);
    }

    @PutMapping("/{requestId}/accept")
    public ResponseEntity<Map<String, Object>> acceptRequest(@PathVariable Long requestId) {
        for (Map<String, Object> req : requests) {
            if (requestId.equals(Long.valueOf(String.valueOf(req.get("id"))))) {
                req.put("status", "ACCEPTED");
                req.put("updatedAt", LocalDateTime.now().toString());
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<Map<String, Object>> rejectRequest(@PathVariable Long requestId) {
        for (Map<String, Object> req : requests) {
            if (requestId.equals(Long.valueOf(String.valueOf(req.get("id"))))) {
                req.put("status", "REJECTED");
                req.put("updatedAt", LocalDateTime.now().toString());
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelRequest(@PathVariable Long requestId) {
        for (Map<String, Object> req : requests) {
            if (requestId.equals(Long.valueOf(String.valueOf(req.get("id"))))) {
                req.put("status", "CANCELLED");
                req.put("updatedAt", LocalDateTime.now().toString());
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.notFound().build();
    }
}
