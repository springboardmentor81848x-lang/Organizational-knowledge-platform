package com.team7.knowledge_gap_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.CompetencyRequirement;
import com.team7.knowledge_gap_platform.repository.CompetencyRequirementRepository;

@Service
public class CompetencyRequirementService {

    private final CompetencyRequirementRepository competencyRequirementRepository;

    public CompetencyRequirementService(
            CompetencyRequirementRepository competencyRequirementRepository) {
        this.competencyRequirementRepository = competencyRequirementRepository;
    }

    public CompetencyRequirement saveCompetencyRequirement(
            CompetencyRequirement competencyRequirement) {

        return competencyRequirementRepository.save(competencyRequirement);
    }

    public List<CompetencyRequirement> getAllCompetencyRequirements() {
        return competencyRequirementRepository.findAll();
    }

    public Optional<CompetencyRequirement> getCompetencyRequirementById(Long id) {
        return competencyRequirementRepository.findById(id);
    }

    public CompetencyRequirement updateCompetencyRequirement(
            Long id,
            CompetencyRequirement competencyRequirement) {

        CompetencyRequirement existingRequirement =
                competencyRequirementRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Competency requirement not found with id: " + id));

        existingRequirement.setJobRoleId(
                competencyRequirement.getJobRoleId());

        existingRequirement.setSkillId(
                competencyRequirement.getSkillId());

        existingRequirement.setRequiredProficiencyLevel(
                competencyRequirement.getRequiredProficiencyLevel());

        return competencyRequirementRepository.save(existingRequirement);
    }

    public void deleteCompetencyRequirement(Long id) {

        CompetencyRequirement existingRequirement =
                competencyRequirementRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Competency requirement not found with id: " + id));

        competencyRequirementRepository.delete(existingRequirement);
    }
}
