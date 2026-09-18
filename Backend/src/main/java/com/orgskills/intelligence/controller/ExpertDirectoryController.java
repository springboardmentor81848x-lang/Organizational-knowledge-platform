package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.expert.ExpertResponse;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.service.ExpertDirectoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Expert directory. Readable by any authenticated employee: finding who knows what is the
 * point of the directory, and it exposes no more than the skill profile already shares.
 */
@RestController
@RequestMapping("/api/experts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ExpertDirectoryController {

    private final ExpertDirectoryService expertDirectoryService;

    @GetMapping
    public ResponseEntity<List<ExpertResponse>> findExperts(
            @RequestParam String skill,
            @RequestParam(required = false) ProficiencyLevel minProficiency) {
        return ResponseEntity.ok(expertDirectoryService.findExperts(skill, minProficiency));
    }
}
