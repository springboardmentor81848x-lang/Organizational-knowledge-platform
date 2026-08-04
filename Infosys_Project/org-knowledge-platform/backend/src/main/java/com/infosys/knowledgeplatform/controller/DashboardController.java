package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.Article;
import com.infosys.knowledgeplatform.repository.ArticleRepository;
import com.infosys.knowledgeplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardData() {
        Map<String, Object> response = new HashMap<>();

        long totalArticles = articleRepository.count();
        long activeUsers = userRepository.count();

        long totalSkillsTracked = 142; // Example static
        long skillGapsIdentified = 38; // Example static
        
        response.put("stats", List.of(
                Map.of("title", "Active Users", "value", String.valueOf(activeUsers), "trend", "+5% this month", "icon", "users"),
                Map.of("title", "Total Skills Tracked", "value", String.valueOf(totalSkillsTracked), "trend", "+12 new", "icon", "target"),
                Map.of("title", "Skill Gaps Identified", "value", String.valueOf(skillGapsIdentified), "trend", "-4% this week", "icon", "trendingDown"),
                Map.of("title", "Active Trainings", "value", "24", "trend", "Past 7 days", "icon", "bookOpen")
        ));

        // Mock Gap Visualization Data
        response.put("gapHeatmap", List.of(
                Map.of("department", "Engineering", "React", 4, "Spring Boot", 2, "AWS", 1, "Kafka", 3),
                Map.of("department", "Marketing", "SEO", 2, "Analytics", 4, "Copywriting", 1, "Design", 2),
                Map.of("department", "Sales", "Negotiation", 1, "CRM", 2, "Lead Gen", 3, "Outreach", 1)
        ));

        // Mock Training Recommendations
        response.put("trainingRecommendations", List.of(
                Map.of("id", 1, "title", "Advanced Spring Boot Microservices", "matchScore", 98, "provider", "Internal", "duration", "12h"),
                Map.of("id", 2, "title", "AWS Solutions Architect Prep", "matchScore", 85, "provider", "Coursera", "duration", "40h"),
                Map.of("id", 3, "title", "Kafka Real-time Streams", "matchScore", 82, "provider", "Udemy", "duration", "8h")
        ));

        response.put("recentArticles", articleRepository.findAll());

        return response;
    }
}
