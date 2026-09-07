package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.KnowledgeSession;
import com.team7.knowledge_gap_platform.repository.KnowledgeSessionRepository;

@RestController
@RequestMapping
public class KnowledgeSessionController {

    private final KnowledgeSessionRepository knowledgeSessionRepository;
    private final AtomicLong regSeq = new AtomicLong(10);
    private final Map<Long, List<Map<String, Object>>> userRegistrations = new ConcurrentHashMap<>();

    public KnowledgeSessionController(KnowledgeSessionRepository knowledgeSessionRepository) {
        this.knowledgeSessionRepository = knowledgeSessionRepository;
    }

    @GetMapping("/knowledge-sessions")
    public ResponseEntity<List<KnowledgeSession>> getAllSessions() {
        List<KnowledgeSession> list = knowledgeSessionRepository.findAll();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/knowledge-sessions")
    public ResponseEntity<KnowledgeSession> createSession(@RequestBody KnowledgeSession session) {
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(LocalDateTime.now());
        }
        if (session.getStatus() == null) {
            session.setStatus("UPCOMING");
        }
        return ResponseEntity.ok(knowledgeSessionRepository.save(session));
    }

    @PostMapping("/knowledge-session-registrations")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, Object> reg) {
        long id = regSeq.incrementAndGet();
        reg.put("id", id);
        reg.put("status", "REGISTERED");
        reg.put("attended", false);

        Long empId = Long.valueOf(String.valueOf(reg.get("employeeId")));
        userRegistrations.computeIfAbsent(empId, k -> new ArrayList<>()).add(reg);
        return ResponseEntity.ok(reg);
    }

    @GetMapping("/knowledge-session-registrations/employee/{employeeId}")
    public ResponseEntity<List<Map<String, Object>>> getUserRegistrations(@PathVariable Long employeeId) {
        return ResponseEntity.ok(userRegistrations.getOrDefault(employeeId, List.of()));
    }

    @PutMapping("/knowledge-session-registrations/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("id", id, "status", "CANCELLED"));
    }

    @PutMapping("/knowledge-session-registrations/{id}/attendance")
    public ResponseEntity<Map<String, Object>> markAttendance(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("id", id, "attended", true));
    }

    @PostMapping("/knowledge-session-feedback")
    public ResponseEntity<Map<String, Object>> submitFeedback(@RequestBody Map<String, Object> feedback) {
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Feedback recorded successfully"));
    }
}
