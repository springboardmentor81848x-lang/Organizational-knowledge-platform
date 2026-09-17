package com.okip.controller;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.training.EmployeeTrainingProgressDTO;
import com.okip.dto.training.TrainingModuleResponseDTO;
import com.okip.dto.training.TrainingResponseDTO;
import com.okip.service.training.EmployeeTrainingProgressService;
import com.okip.service.training.TrainingService;

@RestController
@RequestMapping("/api/employee/trainings")
public class EmployeeTrainingController {

    private final TrainingService trainingService;
    private final EmployeeTrainingProgressService progressService;

    public EmployeeTrainingController(TrainingService trainingService, EmployeeTrainingProgressService progressService) {
        this.trainingService = trainingService;
        this.progressService = progressService;
    }

    @GetMapping
    public ResponseEntity<List<TrainingResponseDTO>> getAvailableTrainings() {
        return ResponseEntity.ok(trainingService.getAllTrainings());
    }

    @GetMapping("/progress")
    public ResponseEntity<List<EmployeeTrainingProgressDTO>> getMyTrainingProgress() {
        return ResponseEntity.ok(progressService.getMyProgress());
    }

    @PostMapping("/{trainingId}/enroll")
    public ResponseEntity<EmployeeTrainingProgressDTO> enrollInTraining(@PathVariable Long trainingId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(progressService.enroll(trainingId));
    }

    @PostMapping("/{trainingId}/start")
    public ResponseEntity<EmployeeTrainingProgressDTO> startTraining(@PathVariable Long trainingId) {
        return ResponseEntity.ok(progressService.start(trainingId));
    }

    @PostMapping("/{trainingId}/heartbeat")
    public ResponseEntity<EmployeeTrainingProgressDTO> heartbeat(@PathVariable Long trainingId) {
        return ResponseEntity.ok(progressService.heartbeat(trainingId));
    }

    @GetMapping("/{trainingId}/content")
    public ResponseEntity<List<TrainingModuleResponseDTO>> getTrainingContent(@PathVariable Long trainingId) {
        return ResponseEntity.ok(progressService.getTrainingContent(trainingId));
    }

    @PostMapping("/{trainingId}/modules/{moduleId}/complete")
    public ResponseEntity<EmployeeTrainingProgressDTO> completeModule(
            @PathVariable Long trainingId, @PathVariable Long moduleId) {
        return ResponseEntity.ok(progressService.completeModule(trainingId, moduleId));
    }
}
