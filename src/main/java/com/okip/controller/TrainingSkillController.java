package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.trainingmapping.TrainingSkillRequestDTO;
import com.okip.dto.trainingmapping.TrainingSkillResponseDTO;
import com.okip.service.trainingmapping.TrainingSkillService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/training-skills")
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class TrainingSkillController {

    private final TrainingSkillService trainingSkillService;

    public TrainingSkillController(
            TrainingSkillService trainingSkillService) {

        this.trainingSkillService = trainingSkillService;
    }

    @PostMapping
    public ResponseEntity<TrainingSkillResponseDTO> createMapping(
            @Valid @RequestBody TrainingSkillRequestDTO request) {

        TrainingSkillResponseDTO response =
                trainingSkillService.createMapping(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping("/training/{trainingId}")
    public ResponseEntity<List<TrainingSkillResponseDTO>>
            getMappingsByTraining(
                    @PathVariable Long trainingId) {

        return ResponseEntity.ok(
                trainingSkillService
                        .getMappingsByTraining(trainingId));
    }

    @GetMapping("/skill/{skillId}")
    public ResponseEntity<List<TrainingSkillResponseDTO>>
            getMappingsBySkill(
                    @PathVariable Long skillId) {

        return ResponseEntity.ok(
                trainingSkillService
                        .getMappingsBySkill(skillId));
    }

    @DeleteMapping("/{trainingSkillId}")
    public ResponseEntity<Void> deleteMapping(
            @PathVariable Long trainingSkillId) {

        trainingSkillService.deleteMapping(
                trainingSkillId);

        return ResponseEntity.noContent().build();
    }
}