package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.TrainingProgram;
import com.infosys.knowledgeplatform.repository.TrainingProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/training-programs")
@CrossOrigin(origins = "http://localhost:5173")
public class TrainingProgramController {

    @Autowired
    private TrainingProgramRepository trainingProgramRepository;

    @GetMapping
    public List<TrainingProgram> getAllTrainingPrograms() {
        return trainingProgramRepository.findAll();
    }

    @GetMapping("/{id}")
    public TrainingProgram getTrainingProgramById(@PathVariable Long id) {
        return trainingProgramRepository.findById(id).orElse(null);
    }

    @PostMapping
    public TrainingProgram createTrainingProgram(@RequestBody TrainingProgram trainingProgram) {
        return trainingProgramRepository.save(trainingProgram);
    }

    @PutMapping("/{id}")
    public TrainingProgram updateTrainingProgram(@PathVariable Long id, @RequestBody TrainingProgram trainingDetails) {
        TrainingProgram program = trainingProgramRepository.findById(id).orElse(null);
        if (program != null) {
            program.setTitle(trainingDetails.getTitle());
            program.setProvider(trainingDetails.getProvider());
            program.setUrl(trainingDetails.getUrl());
            program.setTargetSkillCategory(trainingDetails.getTargetSkillCategory());
            program.setDurationHours(trainingDetails.getDurationHours());
            return trainingProgramRepository.save(program);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteTrainingProgram(@PathVariable Long id) {
        trainingProgramRepository.deleteById(id);
    }
}
