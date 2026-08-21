package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.Enrollment;
import com.infosys.knowledgeplatform.model.TrainingProgram;
import com.infosys.knowledgeplatform.repository.EnrollmentRepository;
import com.infosys.knowledgeplatform.repository.TrainingProgramRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class EnrollmentController {

    private final EnrollmentRepository enrollmentRepository;
    private final TrainingProgramRepository trainingProgramRepository;

    public EnrollmentController(EnrollmentRepository enrollmentRepository, TrainingProgramRepository trainingProgramRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.trainingProgramRepository = trainingProgramRepository;
    }

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(name = "email", required = false) String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.ok(enrollmentRepository.findAll());
        }
        List<Enrollment> items = enrollmentRepository.findByEmployeeEmail(email);
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Enrollment e) {
        e.setEnrolledAt(LocalDateTime.now());
        if (e.getStatus() == null) e.setStatus("enrolled");
        if (e.getProgressPercent() == null) e.setProgressPercent(0);

        if (e.getProgram() != null && e.getProgram().getId() != null) {
            trainingProgramRepository.findById(e.getProgram().getId()).ifPresent(p -> {
                e.setProgramTitle(p.getTitle());
                e.setProvider(p.getProvider());
                e.setProgram(p);
            });
        }

        Enrollment saved = enrollmentRepository.save(e);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Enrollment update) {
        return enrollmentRepository.findById(id).map(existing -> {
            existing.setStatus(update.getStatus() != null ? update.getStatus() : existing.getStatus());
            existing.setProgressPercent(update.getProgressPercent() != null ? update.getProgressPercent() : existing.getProgressPercent());
            if ("completed".equalsIgnoreCase(existing.getStatus())) existing.setCompletedAt(LocalDateTime.now());
            enrollmentRepository.save(existing);
            return ResponseEntity.ok(existing);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        enrollmentRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }
}
