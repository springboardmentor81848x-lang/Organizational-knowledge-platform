package com.knowledgegap.service;

import com.knowledgegap.entity.Competency;
import com.knowledgegap.exception.CompetencyNotFoundException;
import com.knowledgegap.repository.CompetencyRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompetencyService {

    private final CompetencyRepository competencyRepository;

    public CompetencyService(CompetencyRepository competencyRepository) {
        this.competencyRepository = competencyRepository;
    }

    public Competency saveCompetency(Competency competency) {
        return competencyRepository.save(competency);
    }

    public List<Competency> getAllCompetencies() {
        return competencyRepository.findAll();
    }

    public Optional<Competency> getCompetencyById(Long id) {
        return competencyRepository.findById(id);
    }

    public List<Competency> getCompetenciesByDesignation(String designation) {
        List<Competency> competencies =
                competencyRepository.findByDesignation(designation);

        if (competencies.isEmpty()) {
            throw new CompetencyNotFoundException(
                    "No competencies found for designation: " + designation
            );
        }

        return competencies;
    }

    public void deleteCompetency(Long id) {
        competencyRepository.deleteById(id);
    }
}