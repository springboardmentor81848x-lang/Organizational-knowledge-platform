package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.service.SkillGapService;

@RestController
@RequestMapping("/skill-gaps")
public class SkillGapController {

    private final SkillGapService skillGapService;
    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

   @PostMapping("/analyze/{employeeId}")
public ResponseEntity<List<SkillGap>> analyzeEmployeeGaps(
        @PathVariable Long employeeId) {

    return ResponseEntity.ok(
            skillGapService
                    .analyzeAndSaveGapsByEmployee(employeeId)
    );
}

    @GetMapping
    public ResponseEntity<List<SkillGap>> getAllGaps() {
        return ResponseEntity.ok(
                skillGapService.getAllSkillGaps()
        );
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<SkillGap>> getEmployeeGaps(
            @PathVariable Long employeeId) {

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
}
