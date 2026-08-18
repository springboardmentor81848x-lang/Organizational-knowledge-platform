package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.skillmaster.CreateSkillRequestDTO;
import com.okip.dto.skillmaster.SkillMasterResponseDTO;
import com.okip.service.skillmaster.SkillMasterService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/master/skills")
public class SkillMasterController {

    private final SkillMasterService skillMasterService;

    public SkillMasterController(
            SkillMasterService skillMasterService) {

        this.skillMasterService = skillMasterService;
    }

    /**
     * Admin creates a new skill
     */
    @PostMapping
    public ResponseEntity<SkillMasterResponseDTO> createSkill(
            @RequestBody CreateSkillRequestDTO request) {

        SkillMasterResponseDTO response =
                skillMasterService.createSkill(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    /**
     * Get all skills
     */
    @GetMapping
    public ResponseEntity<List<SkillMasterResponseDTO>>
            getAllSkills() {

        return ResponseEntity.ok(
                skillMasterService.getAllSkills());
    }

    /**
     * Get skill by id
     */
    @GetMapping("/{skillId}")
    public ResponseEntity<SkillMasterResponseDTO>
            getSkillById(
                    @PathVariable Long skillId) {

        return ResponseEntity.ok(
                skillMasterService.getSkillById(skillId));
    }

    /**
     * Update skill
     */
    @PutMapping("/{skillId}")
    public ResponseEntity<SkillMasterResponseDTO>
            updateSkill(
                    @PathVariable Long skillId,
                    @RequestBody CreateSkillRequestDTO request) {

        return ResponseEntity.ok(
                skillMasterService.updateSkill(
                        skillId,
                        request));
    }

    /**
     * Delete skill
     */
    @DeleteMapping("/{skillId}")
    public ResponseEntity<String> deleteSkill(
            @PathVariable Long skillId) {

        skillMasterService.deleteSkill(skillId);

        return ResponseEntity.ok(
                "Skill deleted successfully.");
    }
}