package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.MentorProfile;
import com.knowledgegap.service.MentorProfileService;

@RestController
@RequestMapping("/api/mentor-profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class MentorProfileController {

    private final MentorProfileService mentorProfileService;

    public MentorProfileController(
            MentorProfileService mentorProfileService) {

        this.mentorProfileService = mentorProfileService;
    }

    // =====================================================
    // CREATE PROFILE
    // =====================================================

    @PostMapping("/mentor/{mentorId}")
    public ResponseEntity<MentorProfile> createProfile(
            @PathVariable Long mentorId,
            @RequestBody MentorProfile profile) {

        MentorProfile createdProfile =
                mentorProfileService.createProfile(
                        mentorId,
                        profile);

        return new ResponseEntity<>(
                createdProfile,
                HttpStatus.CREATED);
    }

    // =====================================================
    // GET PROFILE BY PROFILE ID
    // =====================================================

    @GetMapping("/{profileId}")
    public ResponseEntity<MentorProfile> getProfileById(
            @PathVariable Long profileId) {

        return ResponseEntity.ok(
                mentorProfileService
                        .getProfileById(profileId));
    }

    // =====================================================
    // GET PROFILE BY MENTOR ID
    // =====================================================

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<MentorProfile> getProfileByMentorId(
            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                mentorProfileService
                        .getProfileByMentorId(mentorId));
    }

    // =====================================================
    // GET ALL MENTOR PROFILES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<MentorProfile>> getAllProfiles() {

        return ResponseEntity.ok(
                mentorProfileService.getAllProfiles());
    }

    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    @PutMapping("/mentor/{mentorId}")
    public ResponseEntity<MentorProfile> updateProfile(
            @PathVariable Long mentorId,
            @RequestBody MentorProfile updatedProfile) {

        return ResponseEntity.ok(
                mentorProfileService.updateProfile(
                        mentorId,
                        updatedProfile));
    }

    // =====================================================
    // DELETE PROFILE
    // =====================================================

    @DeleteMapping("/mentor/{mentorId}")
    public ResponseEntity<Void> deleteProfile(
            @PathVariable Long mentorId) {

        mentorProfileService.deleteProfile(mentorId);

        return ResponseEntity.noContent().build();
    }
}