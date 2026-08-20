package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.KnowledgeSessionRegistration;
import com.team7.knowledge_gap_platform.service.KnowledgeSessionRegistrationService;

@RestController
@RequestMapping("/knowledge-session-registrations")
public class KnowledgeSessionRegistrationController {

    private final KnowledgeSessionRegistrationService service;

    public KnowledgeSessionRegistrationController(
            KnowledgeSessionRegistrationService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<KnowledgeSessionRegistration> register(
            @RequestBody KnowledgeSessionRegistration registration) {

        return ResponseEntity.ok(
                service.register(registration));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<KnowledgeSessionRegistration> cancel(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.cancelRegistration(id));
    }

    @PutMapping("/{id}/attendance")
    public ResponseEntity<KnowledgeSessionRegistration> markAttendance(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.markAttendance(id));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<KnowledgeSessionRegistration>> getBySession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                service.getBySession(sessionId));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<KnowledgeSessionRegistration>> getByEmployee(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                service.getByEmployee(employeeId));
    }

    @GetMapping("/session/{sessionId}/registered")
    public ResponseEntity<List<KnowledgeSessionRegistration>> getRegistered(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                service.getRegisteredParticipants(sessionId));
    }
}