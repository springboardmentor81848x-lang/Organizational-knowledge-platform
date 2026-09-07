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

import com.team7.knowledge_gap_platform.entity.MentorshipSession;
import com.team7.knowledge_gap_platform.repository.MentorshipSessionRepository;

@RestController
@RequestMapping("/mentorship-sessions")
public class MentorshipSessionController {

    private final MentorshipSessionRepository mentorshipSessionRepository;

    public MentorshipSessionController(MentorshipSessionRepository mentorshipSessionRepository) {
        this.mentorshipSessionRepository = mentorshipSessionRepository;
    }

    @PostMapping
    public ResponseEntity<MentorshipSession> scheduleSession(@RequestBody MentorshipSession session) {
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(LocalDateTime.now());
        }
        session.setUpdatedAt(LocalDateTime.now());
        if (session.getStatus() == null) {
            session.setStatus("SCHEDULED");
        }
        MentorshipSession saved = mentorshipSessionRepository.save(session);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/mentee/{menteeId}")
    public ResponseEntity<List<MentorshipSession>> getSessionsByMentee(@PathVariable Long menteeId) {
        List<MentorshipSession> sessions = mentorshipSessionRepository.findByMenteeId(menteeId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorshipSession>> getSessionsByMentor(@PathVariable Long mentorId) {
        List<MentorshipSession> sessions = mentorshipSessionRepository.findByMentorId(mentorId);
        return ResponseEntity.ok(sessions);
    }

    @PutMapping("/{sessionId}/reschedule")
    public ResponseEntity<MentorshipSession> rescheduleSession(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> body) {
        return mentorshipSessionRepository.findById(sessionId).map(session -> {
            String newScheduledAt = body.get("scheduledAt");
            if (newScheduledAt != null) {
                try {
                    session.setScheduledAt(LocalDateTime.parse(newScheduledAt));
                } catch (Exception e) {
                    // Fallback parse if needed
                }
            }
            session.setStatus("RESCHEDULED");
            session.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(mentorshipSessionRepository.save(session));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{sessionId}/cancel")
    public ResponseEntity<MentorshipSession> cancelSession(@PathVariable Long sessionId) {
        return mentorshipSessionRepository.findById(sessionId).map(session -> {
            session.setStatus("CANCELLED");
            session.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(mentorshipSessionRepository.save(session));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{sessionId}/complete")
    public ResponseEntity<MentorshipSession> completeSession(@PathVariable Long sessionId) {
        return mentorshipSessionRepository.findById(sessionId).map(session -> {
            session.setStatus("COMPLETED");
            session.setUpdatedAt(LocalDateTime.now());
            return ResponseEntity.ok(mentorshipSessionRepository.save(session));
        }).orElse(ResponseEntity.notFound().build());
    }
}
