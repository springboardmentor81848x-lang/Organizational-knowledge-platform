package com.okip.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.training.TrainingResponseDTO;
import com.okip.service.training.TrainingService;

@RestController
@RequestMapping("/api/trainings")
@PreAuthorize("hasAnyRole('EMPLOYEE','MANAGER','HR','ADMIN')")
public class TrainingCatalogController {

    private final TrainingService trainingService;

    public TrainingCatalogController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @GetMapping
    public ResponseEntity<List<TrainingResponseDTO>> getAllTrainings() {
        return ResponseEntity.ok(trainingService.getAllTrainings());
    }

    @GetMapping("/{trainingId}")
    public ResponseEntity<TrainingResponseDTO> getTrainingById(@PathVariable Long trainingId) {
        return ResponseEntity.ok(trainingService.getTrainingById(trainingId));
    }
}
