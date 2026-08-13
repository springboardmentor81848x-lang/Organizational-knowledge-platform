package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.service.SkillGapService;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;

@RestController
@RequestMapping("/skill-gaps")
public class SkillGapController {

    private static final Logger logger = LoggerFactory.getLogger(SkillGapController.class);
    private final SkillGapService skillGapService;
    private final EmployeeRepository employeeRepository;

    public SkillGapController(SkillGapService skillGapService, EmployeeRepository employeeRepository) {
        this.skillGapService = skillGapService;
        this.employeeRepository = employeeRepository;
    }

   @PostMapping("/analyze/{employeeId}")
public ResponseEntity<?> analyzeEmployeeGaps(
        @PathVariable Long employeeId) {
    
    logger.info("REST request to analyze gaps for employee: {}", employeeId);
    if (!hasAccessToEmployee(employeeId)) {
        logger.warn("Access denied for analyzing gaps for employee: {}", employeeId);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You can only analyze your own gaps.");
    }

    return ResponseEntity.ok(
            skillGapService
                    .analyzeAndSaveGapsByEmployee(employeeId)
    );
}

    @GetMapping
    public ResponseEntity<List<SkillGap>> getAllGaps() {
        logger.info("REST request to get all skill gaps");
        return ResponseEntity.ok(
                skillGapService.getAllSkillGaps()
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getEmployeeGaps(
            @PathVariable Long employeeId) {

        logger.info("REST request to get gaps for employee: {}", employeeId);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        logger.info("Authenticated user: {}, Authorities: {}", auth.getName(), auth.getAuthorities());

        if (!hasAccessToEmployee(employeeId)) {
            logger.warn("Access denied for fetching gaps for employee: {}", employeeId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You can only view your own gaps.");
        }

        return ResponseEntity.ok(
                skillGapService.getSkillGapsByEmployee(employeeId)
        );
    }

    @GetMapping("/level/{gapLevel}")
    public ResponseEntity<List<SkillGap>> getGapsByLevel(
            @PathVariable String gapLevel) {

        return ResponseEntity.ok(
                skillGapService.getSkillGapsByLevel(
                        gapLevel.toUpperCase())
        );
    }

    @DeleteMapping
    public ResponseEntity<String> deleteAllGaps() {
        skillGapService.deleteAllSkillGaps();
        return ResponseEntity.ok("Skill gaps deleted successfully");
    }

    private boolean hasAccessToEmployee(Long employeeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;

        boolean isManagerOrAbove = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER") || 
                               a.getAuthority().equals("ROLE_HR") || 
                               a.getAuthority().equals("ROLE_ADMIN"));
        
        if (isManagerOrAbove) return true;

        // For employees, check if the ID matches their own record
        String email = authentication.getName();
        return employeeRepository.findByEmail(email)
                .map(e -> e.getId().equals(employeeId))
                .orElse(false);
    }
}
