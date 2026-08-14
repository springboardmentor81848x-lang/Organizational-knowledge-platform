package com.knowledgeiq.controller;

import com.knowledgeiq.dto.SkillDto;
import com.knowledgeiq.service.CompetencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/competency")
public class CompetencyController {

    @Autowired
    private CompetencyService competencyService;

    @Autowired
    private com.knowledgeiq.repository.SkillRepository skillRepository;

    @Autowired
    private com.knowledgeiq.repository.UserRepository userRepository;

    @GetMapping("/skills")
    public ResponseEntity<List<com.knowledgeiq.model.Skill>> getAllSkills() {
        return ResponseEntity.ok(skillRepository.findAll());
    }

    @GetMapping({"/framework", "/framework/"})
    public ResponseEntity<List<SkillDto>> getMyFramework(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).build();
        String userIdStr = (String) auth.getPrincipal();
        com.knowledgeiq.model.User user = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
        if (user != null && user.getRole() != null) {
            return ResponseEntity.ok(competencyService.getCompetencyFrameworkForRole(user.getRole().getId()));
        }
        // If user has no specific role assigned yet, return empty list or general frameworks
        return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    @GetMapping("/framework/{roleId}")
    public ResponseEntity<List<SkillDto>> getFrameworkForRole(@PathVariable UUID roleId) {
        List<SkillDto> benchmarks = competencyService.getCompetencyFrameworkForRole(roleId);
        return ResponseEntity.ok(benchmarks);
    }
}
