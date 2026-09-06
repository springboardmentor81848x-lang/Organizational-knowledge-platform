package com.team7.knowledge_gap_platform.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.CompetencyRequirement;
import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.repository.CompetencyRequirementRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;

@Service
public class KnowledgeGapService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final CompetencyRequirementRepository competencyRequirementRepository;

    public KnowledgeGapService(
            EmployeeSkillRepository employeeSkillRepository,
            CompetencyRequirementRepository competencyRequirementRepository) {

        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRequirementRepository = competencyRequirementRepository;
    }

    public List<String> analyzeKnowledgeGap() {

        List<EmployeeSkill> employeeSkills =
                employeeSkillRepository.findAll();

        List<CompetencyRequirement> requirements =
                competencyRequirementRepository.findAll();

        List<String> gaps = new ArrayList<>();

        for (EmployeeSkill employeeSkill : employeeSkills) {

            for (CompetencyRequirement requirement : requirements) {

                boolean sameSkill =
                        employeeSkill.getSkillId() != null
                        && employeeSkill.getSkillId()
                                .equals(requirement.getSkillId());

                if (sameSkill) {

                    int currentLevel = getLevelValue(
                            employeeSkill.getProficiencyLevel());

                    int requiredLevel = getLevelValue(
                            requirement.getRequiredProficiencyLevel());

                    if (currentLevel < requiredLevel) {

                        gaps.add(
                                "Employee " + employeeSkill.getEmployeeId()
                                + " needs improvement in Skill "
                                + employeeSkill.getSkillId()
                                + ". Current: "
                                + employeeSkill.getProficiencyLevel()
                                + ", Required: "
                                + requirement.getRequiredProficiencyLevel()
                        );
                    }
                }
            }
        }

        return gaps;
    }

    private int getLevelValue(String level) {

        if (level == null) {
            return -1;
        }

        return switch (level.toLowerCase()) {
            case "unaware" -> 0;
            case "beginner" -> 1;
            case "intermediate" -> 2;
            case "advanced" -> 3;
            case "expert" -> 4;
            default -> -1;
        };
    }
}