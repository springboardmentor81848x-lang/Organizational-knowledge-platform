package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.MentorExpertise;
import com.knowledgegap.service.MentorExpertiseService;

@RestController
@RequestMapping("/api/mentor-expertise")
@CrossOrigin(origins = "http://localhost:5173")
public class MentorExpertiseController {

    private final MentorExpertiseService expertiseService;

    public MentorExpertiseController(
            MentorExpertiseService expertiseService) {

        this.expertiseService = expertiseService;
    }

    // =====================================================
    // ADD EXPERTISE
    // =====================================================

    @PostMapping("/mentor/{mentorId}/skill/{skillId}")
    public ResponseEntity<MentorExpertise> addExpertise(

            @PathVariable Long mentorId,

            @PathVariable Long skillId,

            @RequestParam Integer proficiencyLevel) {

        MentorExpertise expertise =
                expertiseService.addExpertise(
                        mentorId,
                        skillId,
                        proficiencyLevel);

        return new ResponseEntity<>(
                expertise,
                HttpStatus.CREATED);
    }

    // =====================================================
    // GET MENTOR EXPERTISE
    // =====================================================

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<MentorExpertise>>
            getMentorExpertise(
                    @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                expertiseService
                        .getMentorExpertise(mentorId));
    }

    // =====================================================
    // GET ONE EXPERTISE
    // =====================================================

    @GetMapping("/{expertiseId}")
    public ResponseEntity<MentorExpertise>
            getExpertiseById(
                    @PathVariable Long expertiseId) {

        return ResponseEntity.ok(
                expertiseService
                        .getExpertiseById(expertiseId));
    }

    // =====================================================
    // UPDATE PROFICIENCY
    // =====================================================

    @PutMapping("/{expertiseId}")
    public ResponseEntity<MentorExpertise>
            updateExpertise(

                    @PathVariable Long expertiseId,

                    @RequestParam Integer proficiencyLevel) {

        return ResponseEntity.ok(
                expertiseService.updateExpertise(
                        expertiseId,
                        proficiencyLevel));
    }

    // =====================================================
    // DELETE EXPERTISE
    // =====================================================

    @DeleteMapping("/{expertiseId}")
    public ResponseEntity<Void> deleteExpertise(

            @PathVariable Long expertiseId) {

        expertiseService.deleteExpertise(
                expertiseId);

        return ResponseEntity.noContent().build();
    }

    // =====================================================
    // COUNT EXPERTISE
    // =====================================================

    @GetMapping("/mentor/{mentorId}/count")
    public ResponseEntity<Long> countMentorExpertise(

            @PathVariable Long mentorId) {

        return ResponseEntity.ok(
                expertiseService
                        .countMentorExpertise(mentorId));
    }
}