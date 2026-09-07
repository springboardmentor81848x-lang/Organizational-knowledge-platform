package com.okip.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.mentorship.MentorProfileDTO;
import com.okip.dto.mentorship.MentorshipRequestDTO;
import com.okip.dto.mentorship.MentorshipResponseDTO;
import com.okip.dto.mentorship.MentorshipStatusUpdateDTO;
import com.okip.service.mentorship.MentorshipService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/mentorships")
@Validated
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR','ADMIN')")
public class MentorshipController {

    private final MentorshipService mentorshipService;

    public MentorshipController(MentorshipService mentorshipService) {
        this.mentorshipService = mentorshipService;
    }

    @GetMapping("/mentors")
    public ResponseEntity<List<MentorProfileDTO>> getAllMentors(
            @RequestParam(required = false) Long skillId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(mentorshipService.getAllMentors(skillId, department, search));
    }

    @GetMapping("/recommended-mentors")
    public ResponseEntity<List<MentorProfileDTO>> getRecommendedMentors() {
        return ResponseEntity.ok(mentorshipService.getRecommendedMentorsForMyGaps());
    }

    @GetMapping("/mentors/{employeeId}")
    public ResponseEntity<MentorProfileDTO> getMentorProfile(@PathVariable Long employeeId) {
        return ResponseEntity.ok(mentorshipService.getMentorProfile(employeeId));
    }

    @PostMapping("/requests")
    public ResponseEntity<MentorshipResponseDTO> sendRequest(@Valid @RequestBody MentorshipRequestDTO request) {
        return new ResponseEntity<>(mentorshipService.sendRequest(request), HttpStatus.CREATED);
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<MentorshipResponseDTO>> getMySentRequests() {
        return ResponseEntity.ok(mentorshipService.getMySentRequests());
    }

    @GetMapping("/requests/received")
    public ResponseEntity<List<MentorshipResponseDTO>> getMyReceivedRequests() {
        return ResponseEntity.ok(mentorshipService.getMyReceivedRequests());
    }

    @GetMapping("/active")
    public ResponseEntity<List<MentorshipResponseDTO>> getActiveMentorships() {
        return ResponseEntity.ok(mentorshipService.getActiveMentorships());
    }

    @PutMapping("/requests/{requestId}/status")
    public ResponseEntity<MentorshipResponseDTO> updateStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody MentorshipStatusUpdateDTO statusUpdate) {
        return ResponseEntity.ok(mentorshipService.updateRequestStatus(requestId, statusUpdate));
    }
}
