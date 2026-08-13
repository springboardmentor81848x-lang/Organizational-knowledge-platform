package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.team7.knowledge_gap_platform.dto.LearningProgressUpdateRequest;
import com.team7.knowledge_gap_platform.entity.LearningPath;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.service.LearningPathService;

@RestController
@RequestMapping("/learning-paths")
public class LearningPathController {

    private final LearningPathService learningPathService;
    private final EmployeeRepository employeeRepository;

    public LearningPathController(
            LearningPathService learningPathService,
            EmployeeRepository employeeRepository) {
        this.learningPathService = learningPathService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/generate/{employeeId}")
    public ResponseEntity<?> generateLearningPath(
            @PathVariable Long employeeId) {

        if (!hasAccessToEmployee(employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: You can only generate your own learning path.");
        }

        return ResponseEntity.ok(
                learningPathService.generateLearningPath(employeeId)
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> getLearningPathByEmployee(
            @PathVariable Long employeeId) {

        if (!hasAccessToEmployee(employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: You can only view your own learning path.");
        }

        return ResponseEntity.ok(
                learningPathService.getLearningPathByEmployee(employeeId)
        );
    }

    @GetMapping("/employee/{employeeId}/skill/{skillId}")
    public ResponseEntity<?> getLearningPathByEmployeeAndSkill(
                    @PathVariable Long employeeId,
                    @PathVariable Long skillId) {

        if (!hasAccessToEmployee(employeeId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: You can only view your own learning path.");
        }

        return ResponseEntity.ok(
                learningPathService.getLearningPathByEmployeeAndSkill(
                                employeeId,
                                skillId)
        );
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<?> updateProgress(
            @PathVariable Long id,
            @RequestBody LearningProgressUpdateRequest request) {

        LearningPath path = learningPathService.getLearningPathById(id);
        if (path == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Learning path item not found with id: " + id);
        }

        if (!hasAccessToEmployee(path.getEmployeeId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: You can only update your own learning progress.");
        }

        return ResponseEntity.ok(
                learningPathService.updateLearningProgress(id, request.getStatus(), request.getCompletionPercentage())
        );
    }

    private boolean hasAccessToEmployee(Long employeeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;

        boolean isManagerOrAbove = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER") || 
                               a.getAuthority().equals("ROLE_HR") || 
                               a.getAuthority().equals("ROLE_ADMIN") ||
                               a.getAuthority().equals("ROLE_DEPARTMENT_HEAD") ||
                               a.getAuthority().equals("ROLE_LEARNING_DEVELOPMENT_ADMIN") ||
                               a.getAuthority().equals("ROLE_MENTOR"));
        
        if (isManagerOrAbove) return true;

        String email = authentication.getName();
        return employeeRepository.findByEmail(email)
                .map(e -> e.getId().equals(employeeId))
                .orElse(false);
    }
}