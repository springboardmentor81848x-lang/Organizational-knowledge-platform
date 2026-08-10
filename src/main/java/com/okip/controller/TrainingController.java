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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.okip.dto.training.TrainingRequestDTO;
import com.okip.dto.training.TrainingResponseDTO;
import com.okip.service.training.TrainingService;

@RestController
@RequestMapping("/api/admin/trainings")
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(
            TrainingService trainingService) {

        this.trainingService = trainingService;
    }

    @PostMapping
    public ResponseEntity<TrainingResponseDTO> createTraining(
            @Valid @RequestBody TrainingRequestDTO request) {

        TrainingResponseDTO response =
                trainingService.createTraining(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TrainingResponseDTO>> getAllTrainings() {

        return ResponseEntity.ok(
                trainingService.getAllTrainings());
    }

    @GetMapping("/{trainingId}")
    public ResponseEntity<TrainingResponseDTO> getTrainingById(
            @PathVariable Long trainingId) {

        return ResponseEntity.ok(
                trainingService.getTrainingById(trainingId));
    }

    @PutMapping("/{trainingId}")
    public ResponseEntity<TrainingResponseDTO> updateTraining(
            @PathVariable Long trainingId,
            @Valid @RequestBody TrainingRequestDTO request) {

        TrainingResponseDTO response =
                trainingService.updateTraining(
                        trainingId,
                        request);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{trainingId}")
    public ResponseEntity<Void> deleteTraining(
            @PathVariable Long trainingId) {

        trainingService.deleteTraining(trainingId);

        return ResponseEntity.noContent().build();
    }
}