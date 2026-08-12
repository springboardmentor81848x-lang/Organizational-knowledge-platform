package com.knowledgegap.controller;

import com.knowledgegap.service.AIRecommendationService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIRecommendationController {

    private final AIRecommendationService aiRecommendationService;

    public AIRecommendationController(
            AIRecommendationService aiRecommendationService) {
        this.aiRecommendationService = aiRecommendationService;
    }

    @GetMapping("/hello")
    public String hello() {
        System.out.println("HELLO ENDPOINT HIT");
        return "Hello AI";
    }

    @GetMapping("/recommendation")
    public String recommendation(
            @RequestParam String role,
            @RequestParam String currentSkills,
            @RequestParam String missingSkills,
            @RequestParam int score) {

        List<String> currentSkillList =
                Arrays.asList(currentSkills.split(","));

        List<String> missingSkillList =
                Arrays.asList(missingSkills.split(","));

        return aiRecommendationService.generateRecommendation(
                role,
                currentSkillList,
                missingSkillList,
                score
        );
    }

    @PostMapping("/ask")
    public String askQuestion(
        @RequestBody Map<String, String> request) {

    String question = request.get("question");
    String learningPath = request.get("learningPath");

    return aiRecommendationService.askQuestion(
            question,
            learningPath
    );
}
}