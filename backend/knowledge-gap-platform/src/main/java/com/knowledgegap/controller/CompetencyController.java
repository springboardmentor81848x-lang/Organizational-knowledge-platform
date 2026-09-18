package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.entity.Competency;
import com.knowledgegap.service.CompetencyService;

@RestController
@RequestMapping("/api/competencies")
@CrossOrigin(origins = "*")
public class CompetencyController {

    private final CompetencyService competencyService;

    public CompetencyController(CompetencyService competencyService) {
        this.competencyService = competencyService;
    }

    @PostMapping
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
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

    @GetMapping("/designation/{designation}")
    public ResponseEntity<List<Competency>> getCompetenciesByDesignation(@PathVariable String designation) {
        return ResponseEntity.ok(competencyService.getCompetenciesByDesignation(designation));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public ResponseEntity<Competency> updateCompetency(@PathVariable Long id,
                                                       @RequestBody Competency competency) {

        return competencyService.getCompetencyById(id)
                .map(existingCompetency -> {

                    existingCompetency.setDesignation(competency.getDesignation());
                    existingCompetency.setSkill(competency.getSkill());
                    existingCompetency.setRequiredLevel(competency.getRequiredLevel());
                    existingCompetency.setDescription(competency.getDescription());

                    return ResponseEntity.ok(
                            competencyService.saveCompetency(existingCompetency)
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public ResponseEntity<String> deleteCompetency(@PathVariable Long id) {
        competencyService.deleteCompetency(id);
        return ResponseEntity.ok("Competency deleted successfully.");
    }
}