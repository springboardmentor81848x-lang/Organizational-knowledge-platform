package com.knowledgeiq.controller;

import com.knowledgeiq.dto.AiChatRequestDto;
import com.knowledgeiq.dto.AiChatResponseDto;
import com.knowledgeiq.model.User;
import com.knowledgeiq.repository.UserRepository;
import com.knowledgeiq.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/onboarding")
    public ResponseEntity<Map<String, Object>> getOnboardingSuggestions(@RequestBody Map<String, String> request) {
        String domain = request.get("domain");
        Map<String, Object> suggestions = aiService.getOnboardingSuggestions(domain);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponseDto> chatWithAi(@RequestBody AiChatRequestDto request, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String userIdStr = (String) auth.getPrincipal();
        User currentUser = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
        
        AiChatResponseDto response = aiService.chatWithAi(currentUser, request.getMessage(), request.getCourseContext());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate-assessment")
    public ResponseEntity<Map<String, Object>> generateAssessment(@RequestBody Map<String, Object> request) {
        String domain = (String) request.get("domain");
        String difficulty = (String) request.get("difficulty");
        Integer questionCount = (request.get("questionCount") instanceof Number) ? ((Number) request.get("questionCount")).intValue() : 5;

        Map<String, Object> assessment = aiService.generateAiAssessment(domain, difficulty, questionCount);
        return ResponseEntity.ok(assessment);
    }

    @PostMapping("/evaluate-assessment")
    public ResponseEntity<Map<String, Object>> evaluateAssessment(@RequestBody Map<String, Object> submission, Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String userIdStr = (String) auth.getPrincipal();
        User currentUser = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
        if (currentUser == null) return ResponseEntity.status(401).build();

        Map<String, Object> evaluation = aiService.evaluateAiAssessment(currentUser, submission);
        return ResponseEntity.ok(evaluation);
    }
}
