package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.MentorshipRequest;
import com.team7.knowledge_gap_platform.service.MentorshipRequestService;

@RestController
@RequestMapping("/mentorship-requests")
public class MentorshipRequestController {

    private final MentorshipRequestService service;

    public MentorshipRequestController(
            MentorshipRequestService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MentorshipRequest> sendRequest(
            @RequestBody MentorshipRequest request) {

        return ResponseEntity.ok(
                service.sendRequest(request)
        );
    }

    @PutMapping("/{requestId}/accept")
    public ResponseEntity<MentorshipRequest> acceptRequest(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                service.acceptRequest(requestId)
        );
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<MentorshipRequest> rejectRequest(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                service.rejectRequest(requestId)
        );
    }

    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<MentorshipRequest> cancelRequest(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                service.cancelRequest(requestId)
        );
    }

    @GetMapping("/mentee/{menteeId}")
    public ResponseEntity<List<MentorshipRequest>> getByMentee(
            @PathVariable Long menteeId) {

        return ResponseEntity.ok(
                service.getRequestsByMentee(menteeId)
        );
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorshipRequest>> getByMentor(
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                service.getRequestsByMentor(mentorId)
        );
    }

    @GetMapping("/mentor/{mentorId}/pending")
    public ResponseEntity<List<MentorshipRequest>> getPendingByMentor(
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                service.getPendingRequestsByMentor(mentorId)
        );
    }
}