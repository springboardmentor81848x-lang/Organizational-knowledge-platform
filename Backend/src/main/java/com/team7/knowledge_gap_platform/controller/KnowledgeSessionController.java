package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.KnowledgeSession;
import com.team7.knowledge_gap_platform.service.KnowledgeSessionService;

@RestController
@RequestMapping("/knowledge-sessions")
public class KnowledgeSessionController {

    private final KnowledgeSessionService service;

    public KnowledgeSessionController(
            KnowledgeSessionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<KnowledgeSession> create(
            @RequestBody KnowledgeSession session) {

        return ResponseEntity.ok(
                service.createSession(session));
    }

    @GetMapping
    public ResponseEntity<List<KnowledgeSession>> getAll() {
        return ResponseEntity.ok(
                service.getAllSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeSession> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getSession(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<KnowledgeSession>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                service.getByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<KnowledgeSession>> search(
            @RequestParam String topic) {

        return ResponseEntity.ok(
                service.searchByTopic(topic));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<KnowledgeSession> complete(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.completeSession(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<KnowledgeSession> cancel(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.cancelSession(id));
    }
}