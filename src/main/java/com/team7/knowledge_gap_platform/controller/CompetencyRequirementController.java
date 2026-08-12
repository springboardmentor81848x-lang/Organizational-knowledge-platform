package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.CompetencyRequirement;
import com.team7.knowledge_gap_platform.service.CompetencyRequirementService;

@RestController
@RequestMapping("/competency-requirements")
public class CompetencyRequirementController {

    private final CompetencyRequirementService competencyRequirementService;

    public CompetencyRequirementController(
            CompetencyRequirementService competencyRequirementService) {
        this.competencyRequirementService = competencyRequirementService;
    }

    @PostMapping
    public CompetencyRequirement saveCompetencyRequirement(
            @RequestBody CompetencyRequirement competencyRequirement) {

        return competencyRequirementService
                .saveCompetencyRequirement(competencyRequirement);
    }

    @GetMapping
    public List<CompetencyRequirement> getAllCompetencyRequirements() {
        return competencyRequirementService.getAllCompetencyRequirements();
    }

    @GetMapping("/{id}")
    public Optional<CompetencyRequirement> getCompetencyRequirementById(
            @PathVariable Long id) {

        return competencyRequirementService
                .getCompetencyRequirementById(id);
    }

    @PutMapping("/{id}")
    public CompetencyRequirement updateCompetencyRequirement(
            @PathVariable Long id,
            @RequestBody CompetencyRequirement competencyRequirement) {

        return competencyRequirementService
                .updateCompetencyRequirement(id, competencyRequirement);
    }

    @DeleteMapping("/{id}")
    public String deleteCompetencyRequirement(@PathVariable Long id) {

        competencyRequirementService.deleteCompetencyRequirement(id);

        return "Competency requirement deleted successfully!";
    }
}
