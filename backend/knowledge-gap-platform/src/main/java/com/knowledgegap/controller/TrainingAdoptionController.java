package com.knowledgegap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.dto.TrainingAdoptionDTO;
import com.knowledgegap.service.TrainingAdoptionService;

@RestController
@RequestMapping("/api/department-head")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainingAdoptionController {

    private final TrainingAdoptionService
            trainingAdoptionService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public TrainingAdoptionController(
            TrainingAdoptionService trainingAdoptionService) {

        this.trainingAdoptionService =
                trainingAdoptionService;
    }

    // =========================================================
    // TRAINING ADOPTION
    // =========================================================

    @GetMapping(
            "/training-adoption/{employeeIdentifier}"
    )
    public ResponseEntity<TrainingAdoptionDTO>
    getTrainingAdoption(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                trainingAdoptionService
                        .getTrainingAdoption(
                                employeeIdentifier
                        )
        );
    }
}