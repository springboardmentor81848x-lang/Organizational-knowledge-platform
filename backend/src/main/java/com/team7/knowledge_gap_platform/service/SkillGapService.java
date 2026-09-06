package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team7.knowledge_gap_platform.entity.CompetencyRequirement;
import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.repository.CompetencyRequirementRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;

@Service
public class SkillGapService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final CompetencyRequirementRepository competencyRequirementRepository;
    private final SkillGapRepository skillGapRepository;
    private final EmployeeRepository employeeRepository;

    public SkillGapService(
            EmployeeSkillRepository employeeSkillRepository,
            CompetencyRequirementRepository competencyRequirementRepository,
            SkillGapRepository skillGapRepository,
            EmployeeRepository employeeRepository) {

        this.employeeSkillRepository = employeeSkillRepository;
        this.competencyRequirementRepository = competencyRequirementRepository;
        this.skillGapRepository = skillGapRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public List<SkillGap> analyzeAndSaveGaps() {
        List<Employee> allEmployees = employeeRepository.findAll();
        List<SkillGap> allSavedGaps = new ArrayList<>();

        for (Employee employee : allEmployees) {
            try {
                allSavedGaps.addAll(analyzeAndSaveGapsByEmployee(employee.getId()));
            } catch (Exception e) {
                // Skip employees without roles or other issues during batch processing
            }
        }
        return allSavedGaps;
    }

    @Transactional
    public List<SkillGap> analyzeAndSaveGapsByEmployee(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Long jobRoleId = employee.getJobRoleId();
        if (jobRoleId == null) {
            throw new RuntimeException("Employee has no Job Role assigned");
        }

        List<CompetencyRequirement> requirements =
                competencyRequirementRepository.findByJobRoleId(jobRoleId);

        List<SkillGap> savedGaps = new ArrayList<>();

        skillGapRepository.deleteByEmployeeId(employeeId);

        for (CompetencyRequirement requirement : requirements) {
            Optional<EmployeeSkill> employeeSkillOpt =
                    employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, requirement.getSkillId());

            int currentLevelValue = 0;
            String currentLevelName = "UNAWARE";

            if (employeeSkillOpt.isPresent()) {
                currentLevelName = employeeSkillOpt.get().getProficiencyLevel();
                currentLevelValue = getLevelValue(currentLevelName);
            }

            int requiredLevelValue = getLevelValue(requirement.getRequiredProficiencyLevel());

            if (currentLevelValue < requiredLevelValue) {
                int gapScore = requiredLevelValue - currentLevelValue;

                SkillGap skillGap = new SkillGap();
                skillGap.setEmployeeId(employeeId);
                skillGap.setJobRoleId(jobRoleId);
                skillGap.setSkillId(requirement.getSkillId());
                skillGap.setCurrentProficiency(currentLevelName);
                skillGap.setRequiredProficiency(requirement.getRequiredProficiencyLevel());
                skillGap.setGapScore(gapScore);
                skillGap.setGapLevel(getGapLevel(gapScore));
                skillGap.setAnalyzedAt(LocalDateTime.now());

                savedGaps.add(skillGapRepository.save(skillGap));
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