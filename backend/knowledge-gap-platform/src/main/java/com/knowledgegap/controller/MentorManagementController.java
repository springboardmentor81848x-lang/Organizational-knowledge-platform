package com.knowledgegap.controller;

import com.knowledgegap.entity.Mentorship;
import com.knowledgegap.service.MentorManagementService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentor-management")
@CrossOrigin(origins = "http://localhost:5173")
public class MentorManagementController {

    private final MentorManagementService mentorManagementService;

    public MentorManagementController(
            MentorManagementService mentorManagementService) {

        this.mentorManagementService =
                mentorManagementService;
    }

    // =========================================================
    // DASHBOARD SUMMARY
    // =========================================================

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {

        return ResponseEntity.ok(
                mentorManagementService.getSummary()
        );
    }

    // =========================================================
    // MENTOR DIRECTORY
    // =========================================================

    @GetMapping("/mentors")
    public ResponseEntity<List<Map<String, Object>>> getAllMentors() {

        return ResponseEntity.ok(
                mentorManagementService.getAllMentors()
        );
    }

    // =========================================================
    // MENTOR PROFILE
    // =========================================================

    @GetMapping("/profile/{employeeIdentifier}")
    public ResponseEntity<?> getMentorProfile(
            @PathVariable String employeeIdentifier) {

        try {

            return ResponseEntity.ok(
                    mentorManagementService
                            .getMentorProfile(employeeIdentifier)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // MENTOR EXPERTISE
    // =========================================================

    @GetMapping("/mentors/{employeeIdentifier}/expertise")
    public ResponseEntity<List<Map<String, Object>>>
    getMentorExpertise(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                mentorManagementService
                        .getExpertise(employeeIdentifier)
        );
    }

    // =========================================================
    // MENTOR REQUESTS
    // =========================================================

    @GetMapping("/requests")
    public ResponseEntity<List<Map<String, Object>>>
    getMentorRequests() {

        return ResponseEntity.ok(
                mentorManagementService
                        .getMentorRequests()
        );
    }

    // =========================================================
    // ACTIVE MENTORSHIPS
    // =========================================================

    @GetMapping("/active")
    public ResponseEntity<List<Map<String, Object>>>
    getActiveMentorships() {

        return ResponseEntity.ok(
                mentorManagementService
                        .getActiveMentorships()
        );
    }

    // =========================================================
    // MENTORSHIP HISTORY
    // =========================================================

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>>
    getMentorshipHistory() {

        return ResponseEntity.ok(
                mentorManagementService
                        .getMentorshipHistory()
        );
    }

    // =========================================================
    // ACCEPT REQUEST
    // =========================================================

    @PutMapping("/requests/{id}/accept")
    public ResponseEntity<?> acceptRequest(
            @PathVariable Long id) {

        try {

            Mentorship mentorship =
                    mentorManagementService
                            .acceptRequest(id);

            return ResponseEntity.ok(mentorship);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // REJECT REQUEST
    // =========================================================

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long id) {

        try {

            Mentorship mentorship =
                    mentorManagementService
                            .rejectRequest(id);

            return ResponseEntity.ok(mentorship);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // ACTIVATE MENTORSHIP
    // =========================================================

    @PutMapping("/mentorships/{id}/activate")
    public ResponseEntity<?> activateMentorship(
            @PathVariable Long id) {

        try {

            Mentorship mentorship =
                    mentorManagementService
                            .activateMentorship(id);

            return ResponseEntity.ok(mentorship);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================================================
    // COMPLETE MENTORSHIP
    // =========================================================

    @PutMapping("/mentorships/{id}/complete")
    public ResponseEntity<?> completeMentorship(
            @PathVariable Long id) {

        try {

            Mentorship mentorship =
                    mentorManagementService
                            .completeMentorship(id);

            return ResponseEntity.ok(mentorship);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}