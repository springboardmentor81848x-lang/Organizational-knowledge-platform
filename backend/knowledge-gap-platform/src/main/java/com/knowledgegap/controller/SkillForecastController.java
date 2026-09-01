package com.knowledgegap.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.service.SkillForecastService;

@RestController
@RequestMapping("/api/hr/skill-forecast")
@CrossOrigin(origins = "http://localhost:5173")
public class SkillForecastController {

    private final SkillForecastService skillForecastService;

    public SkillForecastController(SkillForecastService skillForecastService) {
        this.skillForecastService = skillForecastService;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(skillForecastService.getSummary());
    }

    @GetMapping("/skills")
    public ResponseEntity<List<Map<String, Object>>> getSkillForecast() {
        return ResponseEntity.ok(skillForecastService.getSkillForecast());
    }

    @GetMapping("/at-risk")
    public ResponseEntity<List<Map<String, Object>>> getAtRiskSkills() {
        return ResponseEntity.ok(skillForecastService.getAtRiskSkills());
    }

    @GetMapping("/upskill-vs-hire")
    public ResponseEntity<List<Map<String, Object>>> getUpskillVsHire() {
        return ResponseEntity.ok(skillForecastService.getUpskillVsHire());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Map<String, Object>>> getDepartmentForecasts() {
        return ResponseEntity.ok(skillForecastService.getDepartmentForecasts());
    }
}
