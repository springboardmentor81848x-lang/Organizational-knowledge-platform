package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.MentorProfile;
import com.team7.knowledge_gap_platform.service.MentorProfileService;

@RestController
@RequestMapping("/mentors")
public class MentorProfileController {

    private final MentorProfileService service;

    public MentorProfileController(MentorProfileService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<MentorProfile> create(
            @RequestBody MentorProfile profile) {

        return ResponseEntity.ok(service.create(profile));
    }

    @GetMapping
    public ResponseEntity<List<MentorProfile>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorProfile> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MentorProfile>> search(
            @RequestParam String expertise) {

        return ResponseEntity.ok(service.search(expertise));
    }
}