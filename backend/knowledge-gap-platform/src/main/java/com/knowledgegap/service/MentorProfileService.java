package com.knowledgegap.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.MentorProfile;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.MentorProfileRepository;

@Service
@Transactional
public class MentorProfileService {

    private final MentorProfileRepository mentorProfileRepository;
    private final EmployeeRepository employeeRepository;

    public MentorProfileService(
            MentorProfileRepository mentorProfileRepository,
            EmployeeRepository employeeRepository) {

        this.mentorProfileRepository = mentorProfileRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // CREATE MENTOR PROFILE
    // =========================================================

    public MentorProfile createProfile(
            Long mentorId,
            MentorProfile profile) {

        if (profile == null) {
            throw new IllegalArgumentException(
                    "Mentor profile details are required");
        }

        Employee mentor = employeeRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException(
                        "Mentor not found with ID: " + mentorId));

        // Prevent duplicate profile
        if (mentorProfileRepository
                .findByMentorId(mentorId)
                .isPresent()) {

            throw new IllegalStateException(
                    "Mentor profile already exists");
        }

        validateProfile(profile);

        profile.setMentor(mentor);

        return mentorProfileRepository.save(profile);
    }

    // =========================================================
    // GET PROFILE BY PROFILE ID
    // =========================================================

    @Transactional(readOnly = true)
    public MentorProfile getProfileById(Long profileId) {

        return mentorProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException(
                        "Mentor profile not found"));
    }

    // =========================================================
    // GET PROFILE BY MENTOR ID
    // =========================================================

    @Transactional(readOnly = true)
    public MentorProfile getProfileByMentorId(Long mentorId) {

        return mentorProfileRepository
                .findByMentorId(mentorId)
                .orElseThrow(() -> new RuntimeException(
                        "Mentor profile not found"));
    }

    // =========================================================
    // GET ALL MENTOR PROFILES
    // =========================================================

    @Transactional(readOnly = true)
    public List<MentorProfile> getAllProfiles() {

        return mentorProfileRepository.findAll();
    }

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    public MentorProfile updateProfile(
            Long mentorId,
            MentorProfile updatedProfile) {

        if (updatedProfile == null) {
            throw new IllegalArgumentException(
                    "Mentor profile details are required");
        }

        MentorProfile existingProfile =
                mentorProfileRepository
                        .findByMentorId(mentorId)
                        .orElseThrow(() -> new RuntimeException(
                                "Mentor profile not found"));

        validateProfile(updatedProfile);

        existingProfile.setBio(
                updatedProfile.getBio());

        existingProfile.setExperienceYears(
                updatedProfile.getExperienceYears());

        existingProfile.setMaxMentees(
                updatedProfile.getMaxMentees());

        existingProfile.setAvailability(
                updatedProfile.getAvailability());

        existingProfile.setMentoringMode(
                updatedProfile.getMentoringMode());

        return mentorProfileRepository.save(existingProfile);
    }

    // =========================================================
    // DELETE PROFILE
    // =========================================================

    public void deleteProfile(Long mentorId) {

        MentorProfile profile =
                mentorProfileRepository
                        .findByMentorId(mentorId)
                        .orElseThrow(() -> new RuntimeException(
                                "Mentor profile not found"));

        mentorProfileRepository.delete(profile);
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateProfile(MentorProfile profile) {

        if (profile.getExperienceYears() != null &&
                profile.getExperienceYears() < 0) {

            throw new IllegalArgumentException(
                    "Experience years cannot be negative");
        }

        if (profile.getMaxMentees() != null &&
                profile.getMaxMentees() <= 0) {

            throw new IllegalArgumentException(
                    "Maximum mentees must be greater than 0");
        }

        if (profile.getMentoringMode() != null &&
                profile.getMentoringMode().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Mentoring mode cannot be empty");
        }
    }
}