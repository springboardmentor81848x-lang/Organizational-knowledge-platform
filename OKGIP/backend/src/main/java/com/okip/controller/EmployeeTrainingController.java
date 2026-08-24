package com.okip.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.okip.dto.training.TrainingResponseDTO;
import com.okip.service.training.TrainingService;

@RestController
@RequestMapping("/api/employee/trainings")
public class EmployeeTrainingController {

    private final TrainingService trainingService;

    public EmployeeTrainingController(
            TrainingService trainingService) {

        this.trainingService = trainingService;
    }

    @GetMapping
    public ResponseEntity<List<TrainingResponseDTO>> getAvailableTrainings() {

        return ResponseEntity.ok(
                trainingService.getAllTrainings()
        );
    }
}