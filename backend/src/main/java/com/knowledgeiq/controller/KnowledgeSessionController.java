package com.knowledgeiq.controller;

import com.knowledgeiq.dto.KnowledgeSessionDto;
import com.knowledgeiq.dto.KnowledgeSessionFeedbackDto;
import com.knowledgeiq.service.KnowledgeSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class KnowledgeSessionController {

    @Autowired
    private KnowledgeSessionService sessionService;

    @GetMapping
    public ResponseEntity<List<KnowledgeSessionDto>> getAllSessions(Authentication auth) {
        UUID userId = auth != null ? UUID.fromString((String) auth.getPrincipal()) : null;
        return ResponseEntity.ok(sessionService.getAllSessions(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeSessionDto> getSessionById(@PathVariable UUID id, Authentication auth) {
        UUID userId = auth != null ? UUID.fromString((String) auth.getPrincipal()) : null;
        return ResponseEntity.ok(sessionService.getSessionById(id, userId));
    }

    @PostMapping
    public ResponseEntity<KnowledgeSessionDto> createSession(@RequestBody Map<String, Object> body, Authentication auth) {
        UUID mentorId = UUID.fromString((String) auth.getPrincipal());
        String title = (String) body.get("title");
        String description = (String) body.get("description");
        String skillIdStr = (String) body.get("skillId");
        UUID skillId = (skillIdStr != null && !skillIdStr.isBlank()) ? UUID.fromString(skillIdStr) : null;
        
        String scheduledAtStr = (String) body.get("scheduledAt");
        ZonedDateTime scheduledAt = scheduledAtStr != null ? ZonedDateTime.parse(scheduledAtStr) : ZonedDateTime.now().plusDays(1);
        
        Integer duration = body.get("durationMinutes") != null ? Integer.parseInt(body.get("durationMinutes").toString()) : 60;
        Integer capacity = body.get("capacity") != null ? Integer.parseInt(body.get("capacity").toString()) : 20;
        String meetingLink = (String) body.get("meetingLink");

        return ResponseEntity.ok(sessionService.createSession(mentorId, title, description, skillId, scheduledAt, duration, capacity, meetingLink));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<KnowledgeSessionDto> registerForSession(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(sessionService.registerForSession(id, userId));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<KnowledgeSessionDto> submitFeedback(
            @PathVariable UUID id,
            @RequestBody KnowledgeSessionFeedbackDto req,
            Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(sessionService.submitFeedback(id, userId, req));
    }

    @PutMapping("/{id}/attendance")
    public ResponseEntity<KnowledgeSessionDto> updateAttendance(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        String status = body.getOrDefault("status", "ATTENDED");
        return ResponseEntity.ok(sessionService.updateAttendance(id, userId, status));
    }
}
