package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.KnowledgeSession;
import com.knowledgegap.service.KnowledgeSessionService;

@RestController
@RequestMapping("/api/knowledge-sessions")
@CrossOrigin(origins = "http://localhost:5173")
public class KnowledgeSessionController {

    private final KnowledgeSessionService knowledgeSessionService;

    public KnowledgeSessionController(
            KnowledgeSessionService knowledgeSessionService) {

        this.knowledgeSessionService =
                knowledgeSessionService;
    }

    // =====================================================
    // CREATE SESSION
    // =====================================================

    @PostMapping("/mentor/{mentorId}")
    public ResponseEntity<KnowledgeSession> createSession(
            @PathVariable Long mentorId,
            @RequestBody KnowledgeSession session) {

        KnowledgeSession createdSession =
                knowledgeSessionService.createSession(
                        session,
                        mentorId);

        return new ResponseEntity<>(
                createdSession,
                HttpStatus.CREATED);
    }

    // =====================================================
    // GET ALL SESSIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<KnowledgeSession>>
    getAllSessions() {

        return ResponseEntity.ok(
                knowledgeSessionService
                        .getAllSessions());
    }

    // =====================================================
    // GET AVAILABLE / SCHEDULED SESSIONS
    // EMPLOYEE USES THIS
    // =====================================================

    @GetMapping("/available")
    public ResponseEntity<List<KnowledgeSession>>
    getAvailableSessions() {

        return ResponseEntity.ok(
                knowledgeSessionService
                        .getAvailableSessions());
    }

    // =====================================================
    // GET MENTOR SESSIONS
    // MENTOR USES THIS
    // =====================================================

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<KnowledgeSession>>
    getSessionsByMentor(
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                knowledgeSessionService
                        .getSessionsByMentor(
                                mentorId));
    }

    // =====================================================
    // GET ONE SESSION
    // =====================================================

    @GetMapping("/{sessionId}")
    public ResponseEntity<KnowledgeSession>
    getSessionById(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                knowledgeSessionService
                        .getSessionById(
                                sessionId));
    }

    // =====================================================
    // UPDATE SESSION
    // MENTOR USES THIS
    // =====================================================

    @PutMapping("/{sessionId}/mentor/{mentorId}")
    public ResponseEntity<KnowledgeSession>
    updateSession(
            @PathVariable Long sessionId,
            @PathVariable Long mentorId,
            @RequestBody KnowledgeSession updatedSession) {

        return ResponseEntity.ok(
                knowledgeSessionService.updateSession(
                        sessionId,
                        updatedSession,
                        mentorId));
    }

    // =====================================================
    // CANCEL SESSION
    // MENTOR USES THIS
    // =====================================================

    @PutMapping("/{sessionId}/mentor/{mentorId}/cancel")
    public ResponseEntity<KnowledgeSession>
    cancelSession(
            @PathVariable Long sessionId,
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                knowledgeSessionService.cancelSession(
                        sessionId,
                        mentorId));
    }

    // =====================================================
    // COMPLETE SESSION
    // MENTOR USES THIS
    // =====================================================

    @PutMapping("/{sessionId}/mentor/{mentorId}/complete")
    public ResponseEntity<KnowledgeSession>
    completeSession(
            @PathVariable Long sessionId,
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                knowledgeSessionService.completeSession(
                        sessionId,
                        mentorId));
    }
}