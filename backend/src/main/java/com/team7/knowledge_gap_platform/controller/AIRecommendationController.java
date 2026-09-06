package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.AIRecommendation;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.entity.Skill;
import com.team7.knowledge_gap_platform.entity.JobRole;
import com.team7.knowledge_gap_platform.dto.AIRecommendationDTO;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;
import com.team7.knowledge_gap_platform.repository.SkillRepository;
import com.team7.knowledge_gap_platform.repository.JobRoleRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.service.AIRecommendationService;
import com.team7.knowledge_gap_platform.service.HuggingFaceService;

@RestController
@RequestMapping("/recommendations")
public class AIRecommendationController {

    private final AIRecommendationService aiRecommendationService;
    private final HuggingFaceService huggingFaceService;
    private final SkillGapRepository skillGapRepository;
    private final SkillRepository skillRepository;
    private final JobRoleRepository jobRoleRepository;
    private final EmployeeRepository employeeRepository;

    public AIRecommendationController(
            AIRecommendationService aiRecommendationService,
            HuggingFaceService huggingFaceService,
            SkillGapRepository skillGapRepository,
            SkillRepository skillRepository,
            JobRoleRepository jobRoleRepository,
            EmployeeRepository employeeRepository) {

        this.aiRecommendationService = aiRecommendationService;
        this.huggingFaceService = huggingFaceService;
        this.skillGapRepository = skillGapRepository;
        this.skillRepository = skillRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/generate/{employeeId}")
    public ResponseEntity<?> generateRecommendations(
            @PathVariable Long employeeId) {

        if (!hasAccessToEmployee(employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You can only generate your own recommendations.");
        }

        List<SkillGap> gaps =
                skillGapRepository.findByEmployeeId(employeeId);
        
        List<Skill> allSkills = skillRepository.findAll();
        Map<Long, String> skillMap = allSkills.stream()
                .collect(Collectors.toMap(Skill::getId, Skill::getSkillName, (s1, s2) -> s1));

        String jobRoleName = employeeRepository.findById(employeeId)
                .flatMap(emp -> jobRoleRepository.findById(emp.getJobRoleId()))
                .map(JobRole::getRoleName)
                .orElse("Employee");

        List<AIRecommendationDTO> results = new ArrayList<>();

        for (SkillGap gap : gaps) {
            if (gap.getGapScore() != null && gap.getGapScore() > 0) {
                String skillName = skillMap.getOrDefault(gap.getSkillId(), "Unknown Skill");
                
                String prompt = String.format(
                    "You are a professional learning advisor for %s. " +
                    "Generate a short, specific training recommendation for the skill '%s'. " +
                    "Current level: %s. Required level: %s. Gap level: %s. " +
                    "Include 3 practical steps. Keep it under 100 words.",
                    jobRoleName, skillName, gap.getCurrentProficiency(), 
                    gap.getRequiredProficiency(), gap.getGapLevel()
                );

                String recommendationText;
                try {
                    recommendationText = huggingFaceService.generateRecommendation(prompt);
                } catch (Exception e) {
                    recommendationText = String.format(
                        "Based on your gap in %s, we recommend focusing on advanced topics to reach the %s level. " +
                        "1. Review core concepts. 2. Practice through projects. 3. Take an advanced certification course.",
                        skillName, gap.getRequiredProficiency()
                    );
                }

                aiRecommendationService.saveRecommendation(
                    employeeId, gap.getSkillId(), gap.getGapLevel(), recommendationText, "HuggingFace/Deterministic"
                );

                results.add(new AIRecommendationDTO(
                    skillName,
                    gap.getCurrentProficiency(),
                    gap.getRequiredProficiency(),
                    gap.getGapLevel(),
                    mapGapLevelToPriority(gap.getGapLevel()),
                    recommendationText,
                    "Automated analysis of your current skill gaps in relation to your role as " + jobRoleName
                ));
            }
        }

        return ResponseEntity.ok(results);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getRecommendationsByEmployee(
            @PathVariable Long employeeId) {

        if (!hasAccessToEmployee(employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You can only view your own recommendations.");
        }

        List<AIRecommendation> recommendations = aiRecommendationService.getRecommendationsByEmployee(employeeId);
        List<SkillGap> gaps = skillGapRepository.findByEmployeeId(employeeId);
        List<Skill> allSkills = skillRepository.findAll();
        
        Map<Long, String> skillMap = allSkills.stream()
                .collect(Collectors.toMap(Skill::getId, Skill::getSkillName, (s1, s2) -> s1));
        
        Map<Long, SkillGap> gapMap = gaps.stream()
                .collect(Collectors.toMap(SkillGap::getSkillId, g -> g, (g1, g2) -> g1));

        String jobRoleName = employeeRepository.findById(employeeId)
                .flatMap(emp -> jobRoleRepository.findById(emp.getJobRoleId()))
                .map(JobRole::getRoleName)
                .orElse("Employee");

        List<AIRecommendationDTO> dtos = recommendations.stream().map(rec -> {
            SkillGap gap = gapMap.get(rec.getSkillId());
            return new AIRecommendationDTO(
                skillMap.getOrDefault(rec.getSkillId(), "Unknown Skill"),
                gap != null ? gap.getCurrentProficiency() : "N/A",
                gap != null ? gap.getRequiredProficiency() : "N/A",
                rec.getGapLevel(),
                mapGapLevelToPriority(rec.getGapLevel()),
                rec.getRecommendation(),
                "Based on your role as " + jobRoleName + " and your identified skill gaps."
            );
        }).sorted((d1, d2) -> Integer.compare(d1.getPriority(), d2.getPriority()))
        .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping
    public ResponseEntity<List<AIRecommendation>> getAllRecommendations() {
        return ResponseEntity.ok(aiRecommendationService.getAllRecommendations());
    }

    private int mapGapLevelToPriority(String gapLevel) {
        if (gapLevel == null) return 3;
        switch (gapLevel.toUpperCase()) {
            case "HIGH": return 1;
            case "MEDIUM": return 2;
            case "LOW": return 3;
            default: return 3;
        }
    }

    private boolean hasAccessToEmployee(Long employeeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;

        boolean isManagerOrAbove = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER") || 
                               a.getAuthority().equals("ROLE_HR") || 
                               a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isManagerOrAbove) return true;

        String email = authentication.getName();
        return employeeRepository.findByEmail(email)
                .map(e -> e.getId().equals(employeeId))
                .orElse(false);
    }
}
