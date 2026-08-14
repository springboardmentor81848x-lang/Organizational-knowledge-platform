package com.knowledgeiq.controller;

import com.knowledgeiq.model.MentorshipSession;
import com.knowledgeiq.model.User;
import com.knowledgeiq.service.MentorshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/mentorship")
public class MentorshipController {

    @Autowired
    private MentorshipService mentorshipService;

    @GetMapping("/mentors/skill/{skillId}")
    public ResponseEntity<List<User>> findMentors(@PathVariable UUID skillId, org.springframework.security.core.Authentication auth) {
        UUID menteeId = UUID.fromString((String) auth.getPrincipal());
        return ResponseEntity.ok(mentorshipService.findMentorsForSkill(skillId, menteeId));
    }

    @PostMapping("/request")
    public ResponseEntity<MentorshipSession> requestSession(@RequestBody Map<String, String> request, org.springframework.security.core.Authentication auth) {
        UUID mentorId = UUID.fromString(request.get("mentorId"));
        UUID menteeId = UUID.fromString((String) auth.getPrincipal());
        UUID skillId = UUID.fromString(request.get("skillId"));
        String notes = request.get("notes");
        return ResponseEntity.ok(mentorshipService.requestSession(mentorId, menteeId, skillId, notes));
    }

    @GetMapping("/sessions/me")
    public ResponseEntity<List<MentorshipSession>> getMySessions(org.springframework.security.core.Authentication auth) {
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(mentorshipService.getUserSessions(UUID.fromString(userIdStr)));
    }
}
