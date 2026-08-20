package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.MentorFeedback;
import com.team7.knowledge_gap_platform.service.MentorFeedbackService;

@RestController
@RequestMapping("/mentor-feedback")
public class MentorFeedbackController {

    private final MentorFeedbackService service;

    public MentorFeedbackController(
            MentorFeedbackService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MentorFeedback> addFeedback(
            @RequestBody MentorFeedback feedback) {

        return ResponseEntity.ok(
                service.addFeedback(feedback)
        );
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorFeedback>> getByMentor(
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                service.getByMentor(mentorId)
        );
    }

    @GetMapping("/mentee/{menteeId}")
    public ResponseEntity<List<MentorFeedback>> getByMentee(
            @PathVariable Long menteeId) {

        return ResponseEntity.ok(
                service.getByMentee(menteeId)
        );
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<MentorFeedback>> getBySession(
            @PathVariable Long sessionId) {

        return ResponseEntity.ok(
                service.getBySession(sessionId)
        );
    }

    @GetMapping("/mentor/{mentorId}/average-rating")
    public ResponseEntity<Map<String, Double>> getAverageRating(
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                Map.of(
                        "averageRating",
                        service.getAverageRating(mentorId)
                )
        );
    }
}