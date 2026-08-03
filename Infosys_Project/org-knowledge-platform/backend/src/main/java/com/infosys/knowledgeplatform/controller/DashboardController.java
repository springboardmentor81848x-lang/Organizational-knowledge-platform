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

        // Sample static data for trending
        response.put("stats", List.of(
                Map.of("title", "Total Articles", "value", String.valueOf(totalArticles), "trend", "+12% this month"),
                Map.of("title", "Active Users", "value", String.valueOf(activeUsers), "trend", "+5% this month"),
                Map.of("title", "Contributions", "value", "89", "trend", "Past 7 days"),
                Map.of("title", "Views", "value", "45.2k", "trend", "+18% this month")
        ));

        // Get all articles
        response.put("recentArticles", articleRepository.findAll());

        return response;
    }
}
