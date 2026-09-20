package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.mentorship.CreateFeedbackDTO;
import com.okip.dto.mentorship.CreateKnowledgeSessionDTO;
import com.okip.dto.mentorship.CreateMentorshipRequestDTO;
import com.okip.dto.mentorship.KnowledgeSessionDTO;
import com.okip.dto.mentorship.MentorRecommendationDTO;
import com.okip.dto.mentorship.MentorshipRequestDTO;
import com.okip.service.mentorship.MentorshipService;

@RestController
@RequestMapping("/api/mentorship")
public class MentorshipController {

    private final MentorshipService mentorshipService;

    public MentorshipController(MentorshipService mentorshipService) {
        this.mentorshipService = mentorshipService;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<MentorRecommendationDTO>> getRecommendations() {
        return ResponseEntity.ok(mentorshipService.getRecommendations());
    }

    @GetMapping("/mentees")
public ResponseEntity<List<MentorshipRequestDTO>> getMyMentees() {
    return ResponseEntity.ok(mentorshipService.getMyMentees());
}

    @GetMapping("/requests")
    public ResponseEntity<List<MentorshipRequestDTO>> getMyRequests() {
        return ResponseEntity.ok(mentorshipService.getMyRequests());
    }
    @GetMapping("/mentor-requests")
public ResponseEntity<List<MentorshipRequestDTO>> getMentorRequests() {
    return ResponseEntity.ok(
            mentorshipService.getMentorRequests()
    );
}


    @PostMapping("/requests")
    public ResponseEntity<MentorshipRequestDTO> createRequest(@RequestBody CreateMentorshipRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mentorshipService.createRequest(request));
    }

    @PostMapping("/requests/{requestId}/accept")
    public ResponseEntity<MentorshipRequestDTO> acceptRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(mentorshipService.acceptRequest(requestId));
    }

    @PostMapping("/requests/{requestId}/reject")
    public ResponseEntity<MentorshipRequestDTO> rejectRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(mentorshipService.rejectRequest(requestId));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<KnowledgeSessionDTO>> getMySessions() {
        return ResponseEntity.ok(mentorshipService.getMySessions());
    }

    @PostMapping("/requests/{requestId}/sessions")
    public ResponseEntity<KnowledgeSessionDTO> createSession(
            @PathVariable Long requestId,
            @RequestBody CreateKnowledgeSessionDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mentorshipService.createSession(requestId, request));
    }

    @PostMapping("/sessions/{sessionId}/complete")
    public ResponseEntity<KnowledgeSessionDTO> completeSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(mentorshipService.completeSession(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/cancel")
    public ResponseEntity<KnowledgeSessionDTO> cancelSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(mentorshipService.cancelSession(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/feedback")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable Long sessionId,
            @RequestBody CreateFeedbackDTO request) {
        mentorshipService.submitFeedback(sessionId, request);
        return ResponseEntity.noContent().build();
    }
}
