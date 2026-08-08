package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team7.knowledge_gap_platform.entity.CompetencyRequirement;
import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.repository.CompetencyRequirementRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;

@Service
public class SkillGapService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final CompetencyRequirementRepository competencyRequirementRepository;
    private final SkillGapRepository skillGapRepository;

    public SkillGapService(
            EmployeeSkillRepository employeeSkillRepository,
            CompetencyRequirementRepository competencyRequirementRepository,
            SkillGapRepository skillGapRepository) {

        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRequirementRepository = competencyRequirementRepository;
        this.skillGapRepository = skillGapRepository;
    }

    public List<SkillGap> analyzeAndSaveGaps() {

        List<EmployeeSkill> employeeSkills =
                employeeSkillRepository.findAll();

        List<CompetencyRequirement> requirements =
                competencyRequirementRepository.findAll();

        List<SkillGap> savedGaps = new ArrayList<>();

        for (EmployeeSkill employeeSkill : employeeSkills) {

            for (CompetencyRequirement requirement : requirements) {

                if (employeeSkill.getSkillId() != null
                        && employeeSkill.getSkillId()
                        .equals(requirement.getSkillId())) {

                    int currentLevel =
                            getLevelValue(
                                    employeeSkill.getProficiencyLevel());

                    int requiredLevel =
                            getLevelValue(
                                    requirement.getRequiredProficiencyLevel());

                    int gapScore =
                            Math.max(requiredLevel - currentLevel, 0);

                    SkillGap skillGap = new SkillGap();

                    skillGap.setEmployeeId(
                            employeeSkill.getEmployeeId());

                    skillGap.setJobRoleId(
                            requirement.getJobRoleId());

                    skillGap.setSkillId(
                            employeeSkill.getSkillId());

                    skillGap.setCurrentProficiency(
                            employeeSkill.getProficiencyLevel());

                    skillGap.setRequiredProficiency(
                            requirement.getRequiredProficiencyLevel());

                    skillGap.setGapScore(gapScore);

                    skillGap.setGapLevel(
                            getGapLevel(gapScore));

                    skillGap.setAnalyzedAt(
                            LocalDateTime.now());

                    savedGaps.add(
                            skillGapRepository.save(skillGap));
                }
            }
        }

        return savedGaps;
    }

    @Transactional
    public List<SkillGap> analyzeAndSaveGapsByEmployee(Long employeeId) {

        List<EmployeeSkill> employeeSkills =
                employeeSkillRepository.findByEmployeeId(employeeId);

        List<CompetencyRequirement> requirements =
                competencyRequirementRepository.findAll();

        List<SkillGap> savedGaps = new ArrayList<>();

        skillGapRepository.deleteByEmployeeId(employeeId);

        for (EmployeeSkill employeeSkill : employeeSkills) {

            for (CompetencyRequirement requirement : requirements) {

                if (employeeSkill.getSkillId() != null
                        && employeeSkill.getSkillId()
                        .equals(requirement.getSkillId())) {

                    int currentLevel =
                            getLevelValue(
                                    employeeSkill.getProficiencyLevel());

                    int requiredLevel =
                            getLevelValue(
                                    requirement.getRequiredProficiencyLevel());

                    int gapScore =
                            Math.max(requiredLevel - currentLevel, 0);

                    SkillGap skillGap = new SkillGap();

                    skillGap.setEmployeeId(employeeId);

                    skillGap.setJobRoleId(
                            requirement.getJobRoleId());

                    skillGap.setSkillId(
                            employeeSkill.getSkillId());

                    skillGap.setCurrentProficiency(
                            employeeSkill.getProficiencyLevel());

                    skillGap.setRequiredProficiency(
                            requirement.getRequiredProficiencyLevel());

                    skillGap.setGapScore(gapScore);

                    skillGap.setGapLevel(
                            getGapLevel(gapScore));

                    skillGap.setAnalyzedAt(
                            LocalDateTime.now());

                    savedGaps.add(
                            skillGapRepository.save(skillGap));
                }
            }
        }

        return savedGaps;
    }

    public List<SkillGap> getAllSkillGaps() {
        return skillGapRepository.findAll();
    }

    public List<SkillGap> getSkillGapsByEmployee(Long employeeId) {
        return skillGapRepository.findByEmployeeId(employeeId);
    }

    public List<SkillGap> getSkillGapsByLevel(String gapLevel) {
        return skillGapRepository.findByGapLevel(gapLevel);
    }

    public void deleteAllSkillGaps() {
        skillGapRepository.deleteAll();
    }

    private int getLevelValue(String level) {

        if (level == null) {
            return 0;
        }

        return switch (level.toLowerCase()) {
            case "unaware" -> 0;
            case "beginner" -> 1;
            case "intermediate" -> 2;
            case "advanced" -> 3;
            case "expert" -> 4;
            default -> 0;
        };
    }

    private String getGapLevel(int gapScore) {

        if (gapScore == 0) {
            return "NO_GAP";
        }

        if (gapScore == 1) {
            return "LOW";
        }

        if (gapScore == 2) {
            return "MEDIUM";
        }

        return "HIGH";
    }
}