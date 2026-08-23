package com.team7.knowledge_gap_platform.controller;

import com.team7.knowledge_gap_platform.service.DatabaseSeederService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debug")
public class DatabaseSeederController {

    private final DatabaseSeederService seederService;

    public DatabaseSeederController(DatabaseSeederService seederService) {
        this.seederService = seederService;
    }

    @PostMapping("/seed-assessments")
    public ResponseEntity<String> forceSeed() {
        String result = seederService.seedAssessments();
        return ResponseEntity.ok(result);
    }
}
