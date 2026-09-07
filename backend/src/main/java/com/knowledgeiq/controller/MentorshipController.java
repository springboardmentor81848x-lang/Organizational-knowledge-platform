package com.knowledgeiq.controller;

import com.knowledgeiq.dto.*;
import com.knowledgeiq.service.MentorshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/mentorship", "/api/mentorships"})
public class MentorshipController {

    @Autowired
    private MentorshipService mentorshipService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<MentorRecommendationDto>> getRecommendations(Authentication auth) {
        UUID menteeId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.getRecommendationsForMentee(menteeId));
    }

    @PostMapping("/request")
    public ResponseEntity<MentorshipDto> requestMentorship(@RequestBody MentorshipRequestDto request, Authentication auth) {
        UUID menteeId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.requestMentorship(menteeId, request));
    }

    @GetMapping("/my-mentors")
    public ResponseEntity<List<MentorshipDto>> getMyMentors(Authentication auth) {
        UUID menteeId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.getMyMentors(menteeId));
    }

    @GetMapping("/my-mentees")
    public ResponseEntity<List<MentorshipDto>> getMyMentees(Authentication auth) {
        UUID mentorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.getMyMentees(mentorId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorshipDto> getMentorshipById(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.getMentorshipById(id, userId));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<MentorshipDto> acceptMentorship(@PathVariable UUID id, Authentication auth) {
        UUID mentorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.acceptMentorship(id, mentorId));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<MentorshipDto> rejectMentorship(@PathVariable UUID id, Authentication auth) {
        UUID mentorId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.rejectMentorship(id, mentorId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<MentorshipDto> cancelMentorship(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.cancelMentorship(id, userId));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<MentorshipDto> completeMentorship(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.completeMentorship(id, userId));
    }

    // CHAT & MESSAGING
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<MentorshipMessageDto>> getMessages(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.getMessages(id, userId));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MentorshipMessageDto> sendMessage(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UUID senderId = UUID.fromString((String) auth.getPrincipal());
        String text = body.get("message");
        String type = body.getOrDefault("messageType", "TEXT");
        String resourceUrl = body.get("resourceUrl");
        String resourceTitle = body.get("resourceTitle");
        return ResponseEntity.ok(mentorshipService.sendMessage(id, senderId, text, type, resourceUrl, resourceTitle));
    }

    @PostMapping("/{id}/meeting-link")
    public ResponseEntity<MentorshipDto> updateMeetingLink(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        String meetingLink = body.get("meetingLink");
        return ResponseEntity.ok(mentorshipService.updateMeetingLink(id, userId, meetingLink));
    }

    // EXPERT DIRECTORY
    @GetMapping("/experts")
    public ResponseEntity<List<ExpertProfileDto>> getExpertDirectory(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String skill,
            Authentication auth) {
        UUID currentUserId = auth != null ? UUID.fromString((String) auth.getPrincipal()) : null;
        return ResponseEntity.ok(mentorshipService.getExpertDirectory(query, department, skill, currentUserId));
    }
}
