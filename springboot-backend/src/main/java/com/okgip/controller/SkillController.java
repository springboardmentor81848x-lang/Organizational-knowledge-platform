package com.okgip.controller;

import com.okgip.entity.Skill;
import com.okgip.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/skills")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SkillController {

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping
    public ResponseEntity<?> getAllSkills() {
        List<Skill> list = skillRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PostMapping
    public ResponseEntity<?> createSkill(@RequestBody Skill skill) {
        Skill saved = skillRepository.save(skill);
        return ResponseEntity.status(201).json(Map.of("success", true, "message", "Skill created", "data", saved));
    }
}
