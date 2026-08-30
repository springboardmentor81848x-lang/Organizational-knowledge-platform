package com.okip.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.session.KnowledgeSessionRequestDTO;
import com.okip.dto.session.KnowledgeSessionResponseDTO;
import com.okip.dto.session.SessionFeedbackDTO;
import com.okip.dto.session.SessionRegistrationDTO;
import com.okip.service.session.KnowledgeSessionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/knowledge-sessions")
@Validated
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR','ADMIN')")
public class KnowledgeSessionController {

    private final KnowledgeSessionService sessionService;

    public KnowledgeSessionController(KnowledgeSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<KnowledgeSessionResponseDTO> createSession(
            @Valid @RequestBody KnowledgeSessionRequestDTO request) {
        return new ResponseEntity<>(sessionService.createSession(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<KnowledgeSessionResponseDTO>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<KnowledgeSessionResponseDTO>> getUpcomingSessions() {
        return ResponseEntity.ok(sessionService.getAllUpcomingSessions());
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<KnowledgeSessionResponseDTO> getSessionById(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionById(sessionId));
    }

    @PostMapping("/{sessionId}/register")
    public ResponseEntity<SessionRegistrationDTO> registerForSession(@PathVariable Long sessionId) {
        return new ResponseEntity<>(sessionService.registerForSession(sessionId), HttpStatus.CREATED);
    }

    @DeleteMapping("/{sessionId}/register")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long sessionId) {
        sessionService.cancelRegistration(sessionId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-registrations")
    public ResponseEntity<List<SessionRegistrationDTO>> getMyRegistrations() {
        return ResponseEntity.ok(sessionService.getMyRegisteredSessions());
    }

    @PostMapping("/{sessionId}/feedback")
    public ResponseEntity<SessionRegistrationDTO> submitFeedback(
            @PathVariable Long sessionId,
            @Valid @RequestBody SessionFeedbackDTO feedback) {
        return ResponseEntity.ok(sessionService.submitFeedback(sessionId, feedback));
    }

    @GetMapping("/{sessionId}/registrations")
    public ResponseEntity<List<SessionRegistrationDTO>> getSessionRegistrations(@PathVariable Long sessionId) {
        return ResponseEntity.ok(sessionService.getSessionRegistrations(sessionId));
    }
}
