package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.experience.AddExperienceRequestDTO;
import com.okip.dto.experience.ExperienceResponseDTO;
import com.okip.service.experience.ExperienceService;

@RestController
@RequestMapping("/api/experience")
public class ExperienceController {

    private final ExperienceService experienceService;

    public ExperienceController(
            ExperienceService experienceService) {

        this.experienceService = experienceService;
    }

    @PostMapping
    public ResponseEntity<ExperienceResponseDTO>
            addExperience(
                    @RequestBody
                    AddExperienceRequestDTO request) {

        ExperienceResponseDTO response =
                experienceService.addExperience(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ExperienceResponseDTO>>
            getMyExperiences() {

        return ResponseEntity.ok(
                experienceService.getMyExperiences());
    }

    @PutMapping("/{experienceId}")
    public ResponseEntity<ExperienceResponseDTO>
            updateExperience(
                    @PathVariable Long experienceId,
                    @RequestBody
                    AddExperienceRequestDTO request) {

        return ResponseEntity.ok(
                experienceService.updateExperience(
                        experienceId,
                        request));
    }

    @DeleteMapping("/{experienceId}")
    public ResponseEntity<String>
            deleteExperience(
                    @PathVariable Long experienceId) {

        experienceService.deleteExperience(
                experienceId);

        return ResponseEntity.ok(
                "Experience deleted successfully.");
    }
}