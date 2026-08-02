package com.knowledgegap.controller;

import com.knowledgegap.entity.Competency;
import com.knowledgegap.service.CompetencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/competencies")
public class CompetencyController {

    private final CompetencyService competencyService;

    public CompetencyController(CompetencyService competencyService) {
        this.competencyService = competencyService;
    }

    @PostMapping
    public ResponseEntity<Competency> saveCompetency(@RequestBody Competency competency) {
        return ResponseEntity.ok(competencyService.saveCompetency(competency));
    }

    @GetMapping
    public ResponseEntity<List<Competency>> getAllCompetencies() {
        return ResponseEntity.ok(competencyService.getAllCompetencies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Competency> getCompetencyById(@PathVariable Long id) {
        return competencyService.getCompetencyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCompetency(@PathVariable Long id) {
        competencyService.deleteCompetency(id);
        return ResponseEntity.ok("Competency deleted successfully.");
    }
}