package com.team7.knowledge_gap_platform.controller;

import java.util.ArrayList;
import java.util.HashMap;
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

@RestController
@RequestMapping
public class KnowledgeSessionController {

    private final AtomicLong sessionSeq = new AtomicLong(10);
    private final AtomicLong regSeq = new AtomicLong(10);

    private final List<Map<String, Object>> sessions = new ArrayList<>();
    private final Map<Long, List<Map<String, Object>>> userRegistrations = new ConcurrentHashMap<>();

    public KnowledgeSessionController() {
        sessions.add(createSessionMap(
                1L,
                "Advanced Spring Boot Microservices Architecture",
                "Deep dive into reactive microservice patterns, distributed tracing, and resilience mechanisms.",
                "Architecture",
                3L,
                "2026-09-15T15:00:00",
                60,
                "https://meet.google.com/kgap-session-1",
                50,
                "UPCOMING",
                "2026-09-01T10:00:00"
        ));
        sessions.add(createSessionMap(
                2L,
                "PostgreSQL Indexing & High-Performance Query Optimization",
                "Learn query execution plans, vacuuming strategies, partitioning, and indexing best practices.",
                "System Design",
                1L,
                "2026-09-18T16:00:00",
                45,
                "https://meet.google.com/kgap-session-2",
                40,
                "UPCOMING",
                "2026-09-02T10:00:00"
        ));
        sessions.add(createSessionMap(
                3L,
                "Production GenAI & LLM Integration in Enterprise",
                "Practical guide to RAG pipelines, fine-tuning Llama models, and embedding vector stores.",
                "Cloud",
                2L,
                "2026-09-22T14:00:00",
                75,
                "https://meet.google.com/kgap-session-3",
                60,
                "UPCOMING",
                "2026-09-03T10:00:00"
        ));
    }

    private static Map<String, Object> createSessionMap(Long id, String title, String desc, String topic, Long createdBy, String scheduledAt, int duration, String link, int maxPart, String status, String createdAt) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("title", title);
        map.put("description", desc);
        map.put("topic", topic);
        map.put("createdByEmployeeId", createdBy);
        map.put("scheduledAt", scheduledAt);
        map.put("durationMinutes", duration);
        map.put("meetingLink", link);
        map.put("maxParticipants", maxPart);
        map.put("status", status);
        map.put("createdAt", createdAt);
        return map;
    }

    @GetMapping("/knowledge-sessions")
    public ResponseEntity<List<Map<String, Object>>> getAllSessions() {
        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/knowledge-sessions")
    public ResponseEntity<Map<String, Object>> createSession(@RequestBody Map<String, Object> session) {
        long id = sessionSeq.incrementAndGet();
        session.put("id", id);
        session.put("status", "UPCOMING");
        sessions.add(session);
        return ResponseEntity.ok(session);
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
