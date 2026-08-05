package com.knowledgegap.service;

import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Role;
import com.knowledgegap.exception.CompetencyNotFoundException;
import com.knowledgegap.repository.CompetencyRepository;
import com.knowledgegap.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CompetencyService {

    private final CompetencyRepository competencyRepository;
    private final RoleRepository roleRepository;

    public CompetencyService(CompetencyRepository competencyRepository, RoleRepository roleRepository) {
        this.competencyRepository = competencyRepository;
        this.roleRepository = roleRepository;
    }

    public Competency saveCompetency(Competency competency) {
        return competencyRepository.save(competency);
    }

    public List<Competency> getAllCompetencies() {
        return competencyRepository.findAll();
    }

    public List<Competency> getCompetenciesByRole(Role role) {
        return competencyRepository.findByRole(role);
    }

    public Optional<Competency> getCompetencyById(Long id) {
        return competencyRepository.findById(id);
    }

    public List<Competency> getCompetenciesByDesignation(String designation) {
        Role role = roleRepository.findByRoleName(designation)
                .orElseThrow(() -> new CompetencyNotFoundException("Designation not found: " + designation));
        return competencyRepository.findByRole(role);
    }

    public void deleteCompetency(Long id) {
        competencyRepository.deleteById(id);
    }
}