package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.MentorshipSession;
import com.team7.knowledge_gap_platform.service.MentorshipSessionService;

@RestController
@RequestMapping("/mentorship-sessions")
public class MentorshipSessionController {

    private final MentorshipSessionService service;

    public MentorshipSessionController(
            MentorshipSessionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MentorshipSession> scheduleSession(
            @RequestBody MentorshipSession session) {

        return ResponseEntity.ok(
                service.scheduleSession(session)
        );
    }

    @PutMapping("/{sessionId}/reschedule")
    public ResponseEntity<MentorshipSession> rescheduleSession(
            @PathVariable Long sessionId,
            @RequestBody Map<String, String> body) {

        LocalDateTime newDateTime =
                LocalDateTime.parse(body.get("scheduledAt"));

        return ResponseEntity.ok(
                service.rescheduleSession(
                        sessionId,
                        newDateTime)
        );
    }

    @PutMapping("/{sessionId}/cancel")
    public ResponseEntity<MentorshipSession> cancelSession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                service.cancelSession(sessionId)
        );
    }

    @PutMapping("/{sessionId}/complete")
    public ResponseEntity<MentorshipSession> completeSession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                service.completeSession(sessionId)
        );
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<MentorshipSession> getSession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                service.getSession(sessionId)
        );
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorshipSession>> getByMentor(
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                service.getByMentor(mentorId)
        );
    }

    @GetMapping("/mentee/{menteeId}")
    public ResponseEntity<List<MentorshipSession>> getByMentee(
            @PathVariable Long menteeId) {

        return ResponseEntity.ok(
                service.getByMentee(menteeId)
        );
    }

    @GetMapping("/request/{requestId}")
    public ResponseEntity<List<MentorshipSession>> getByRequest(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                service.getByRequest(requestId)
        );
    }
}