package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.skill.SkillRequestDTO;
import com.okip.dto.skill.SkillResponseDTO;
import com.okip.service.skill.SkillService;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    /**
     * Employee adds a skill from Skill Master
     */
    @PostMapping
    public ResponseEntity<SkillResponseDTO> addSkill(
            @RequestBody SkillRequestDTO request) {

        SkillResponseDTO response =
                skillService.addSkill(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    /**
     * Logged-in employee skills
     */
    @GetMapping
    public ResponseEntity<List<SkillResponseDTO>> getMySkills() {

        List<SkillResponseDTO> response =
                skillService.getMySkills();

        return ResponseEntity.ok(response);
    }

    /**
     * Update employee skill
     */
    @PutMapping("/{employeeSkillId}")
    public ResponseEntity<SkillResponseDTO> updateSkill(
            @PathVariable Long employeeSkillId,
            @RequestBody SkillRequestDTO request) {

        SkillResponseDTO response =
                skillService.updateSkill(
                        employeeSkillId,
                        request);

        return ResponseEntity.ok(response);
    }

    /**
     * Delete employee skill
     */
    @DeleteMapping("/{employeeSkillId}")
    public ResponseEntity<String> deleteSkill(
            @PathVariable Long employeeSkillId) {

        skillService.deleteSkill(employeeSkillId);

        return ResponseEntity.ok(
                "Skill deleted successfully.");
    }
}