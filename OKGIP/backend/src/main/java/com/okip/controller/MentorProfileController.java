package com.okip.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.entity.master.MentorProfile;
import com.okip.service.mentor.MentorProfileService;

@RestController
@RequestMapping("/api/mentor")
public class MentorProfileController {

    private final MentorProfileService mentorProfileService;

    public MentorProfileController(
            MentorProfileService mentorProfileService) {

        this.mentorProfileService = mentorProfileService;
    }

    /**
     * Assign an existing employee as an active mentor.
     *
     * The employee's original role is not changed.
     */
    @PostMapping("/assign/{employeeId}")
    public ResponseEntity<MentorProfile> assignMentor(
            @PathVariable Long employeeId) {

        MentorProfile mentorProfile =
                mentorProfileService.assignMentor(employeeId);

        return ResponseEntity.ok(mentorProfile);
    }

    /**
     * Deactivate an employee's mentor assignment.
     */
    @PostMapping("/unassign/{employeeId}")
    public ResponseEntity<MentorProfile> unassignMentor(
            @PathVariable Long employeeId) {

        MentorProfile mentorProfile =
                mentorProfileService.unassignMentor(employeeId);

        return ResponseEntity.ok(mentorProfile);
    }

    /**
     * Get mentor profile information.
     */
    @GetMapping("/profile/{employeeId}")
    public ResponseEntity<MentorProfile> getMentorProfile(
            @PathVariable Long employeeId) {

        MentorProfile mentorProfile =
                mentorProfileService.getMentorProfile(employeeId);

        return ResponseEntity.ok(mentorProfile);
    }

    /**
     * Check whether an employee is currently an active mentor.
     */
    @GetMapping("/status/{employeeId}")
    public ResponseEntity<Boolean> getMentorStatus(
            @PathVariable Long employeeId) {

        boolean active =
                mentorProfileService.isActiveMentor(employeeId);

        return ResponseEntity.ok(active);
    }
}