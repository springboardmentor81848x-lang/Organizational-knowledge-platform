package com.knowledgegap.service;

import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.Role;
import com.knowledgegap.repository.KnowledgeGapRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class KnowledgeGapService {

    private final KnowledgeGapRepository knowledgeGapRepository;
    private final EmployeeSkillService employeeSkillService;
    private final CompetencyService competencyService;

    public KnowledgeGapService(KnowledgeGapRepository knowledgeGapRepository,
                               EmployeeSkillService employeeSkillService,
                               CompetencyService competencyService) {
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.employeeSkillService = employeeSkillService;
        this.competencyService = competencyService;
    }

    // Save a KnowledgeGap
    public KnowledgeGap saveKnowledgeGap(KnowledgeGap knowledgeGap) {
        return knowledgeGapRepository.save(knowledgeGap);
    }

    // Get all KnowledgeGaps
    public List<KnowledgeGap> getAllKnowledgeGaps() {
        return knowledgeGapRepository.findAll();
    }

    // Get KnowledgeGap by ID
    public Optional<KnowledgeGap> getKnowledgeGapById(Long id) {
        return knowledgeGapRepository.findById(id);
    }

    public List<KnowledgeGap> getKnowledgeGapsByEmployee(Employee employee) {
        return knowledgeGapRepository.findByEmployee(employee);
    }

    public List<KnowledgeGap> detectAndSaveGaps(Employee employee) {
        if (employee == null || employee.getRole() == null) {
            return List.of();
        }

        List<EmployeeSkill> currentSkills = employeeSkillService.getSkillsByEmployee(employee);
        List<Competency> requiredCompetencies = competencyService.getCompetenciesByRole(employee.getRole());

        Map<Long, EmployeeSkill> skillMap = new HashMap<>();
        for (EmployeeSkill current : currentSkills) {
            if (current.getSkill() != null && current.getSkill().getId() != null) {
                skillMap.put(current.getSkill().getId(), current);
            }
        }

        knowledgeGapRepository.deleteByEmployee(employee);

        List<KnowledgeGap> gapResults = new ArrayList<>();
        for (Competency competency : requiredCompetencies) {
            if (competency.getSkill() == null) {
                continue;
            }
            int requiredLevel = competency.getRequiredLevel() != null ? competency.getRequiredLevel() : 0;
            EmployeeSkill currentSkill = skillMap.get(competency.getSkill().getId());
            int currentLevel = currentSkill != null && currentSkill.getCurrentLevel() != null ? currentSkill.getCurrentLevel() : 0;
            int gap = Math.max(0, requiredLevel - currentLevel);

            if (gap > 0) {
                KnowledgeGap knowledgeGap = new KnowledgeGap();
                knowledgeGap.setEmployee(employee);
                knowledgeGap.setSkill(competency.getSkill());
                knowledgeGap.setCurrentLevel(currentLevel);
                knowledgeGap.setRequiredLevel(requiredLevel);
                knowledgeGap.setGap(gap);
                gapResults.add(knowledgeGapRepository.save(knowledgeGap));
            }
        }

        return gapResults;
    }

    // Delete KnowledgeGap by ID
    public void deleteKnowledgeGap(Long id) {
        knowledgeGapRepository.deleteById(id);
    }
}