package com.knowledgeiq.controller;

import com.knowledgeiq.dto.*;
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

    @GetMapping("/eligible-skills")
    public ResponseEntity<List<SkillDto>> getEligibleHostSkills(Authentication auth) {
        UUID mentorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(sessionService.getEligibleHostSkills(mentorId));
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
        String skillIdStr = body.get("skillId") != null ? body.get("skillId").toString() : null;
        UUID skillId = null;
        if (skillIdStr != null && !skillIdStr.isBlank()) {
            try {
                skillId = UUID.fromString(skillIdStr);
            } catch (Exception ignored) {}
        }
        
        String scheduledAtStr = body.get("scheduledAt") != null ? body.get("scheduledAt").toString() : null;
        ZonedDateTime scheduledAt = ZonedDateTime.now().plusDays(1);
        if (scheduledAtStr != null && !scheduledAtStr.isBlank()) {
            try {
                scheduledAt = ZonedDateTime.parse(scheduledAtStr);
            } catch (Exception e) {
                try {
                    scheduledAt = java.time.LocalDateTime.parse(scheduledAtStr).atZone(java.time.ZoneId.systemDefault());
                } catch (Exception ignored) {}
            }
        }
        
        Integer duration = body.get("durationMinutes") != null ? Integer.parseInt(body.get("durationMinutes").toString()) : 60;
        Integer capacity = body.get("capacity") != null ? Integer.parseInt(body.get("capacity").toString()) : 20;
        String meetingLink = body.get("meetingLink") != null ? body.get("meetingLink").toString() : null;

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

    @DeleteMapping("/{id}/register")
    public ResponseEntity<KnowledgeSessionDto> cancelRegistration(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(sessionService.cancelRegistration(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeSessionDto> editSession(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        UUID mentorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(sessionService.editSession(id, mentorId, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> cancelSession(@PathVariable UUID id, Authentication auth) {
        UUID mentorId = UUID.fromString((String) auth.getPrincipal());
        sessionService.cancelSession(id, mentorId);
        return ResponseEntity.ok(Map.of("message", "Session successfully cancelled."));
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
