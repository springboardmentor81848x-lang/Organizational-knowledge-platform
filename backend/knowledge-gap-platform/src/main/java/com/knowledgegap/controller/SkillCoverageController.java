package com.knowledgegap.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.dto.SkillCoverageDTO;
import com.knowledgegap.service.SkillCoverageService;

@RestController
@RequestMapping("/api/department-head")
@CrossOrigin(origins = "http://localhost:5173")
public class SkillCoverageController {

    private final SkillCoverageService skillCoverageService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SkillCoverageController(
            SkillCoverageService skillCoverageService) {

        this.skillCoverageService =
                skillCoverageService;
    }

    // =========================================================
    // SKILL COVERAGE
    // =========================================================

    @GetMapping("/skill-coverage/{employeeIdentifier}")
    public ResponseEntity<SkillCoverageDTO>
    getSkillCoverage(
            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                skillCoverageService
                        .getSkillCoverage(
                                employeeIdentifier
                        )
        );
    }
}
