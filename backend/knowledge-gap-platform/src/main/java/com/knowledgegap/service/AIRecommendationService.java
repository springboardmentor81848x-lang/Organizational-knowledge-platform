package com.knowledgegap.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AIRecommendationService {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    public AIRecommendationService(RestClient restClient) {
        this.restClient = restClient;
    }
    public String generateRecommendation(String role,
                                     List<String> currentSkills,
                                     List<String> missingSkills,
                                     int score) {

    System.out.println("API Key: " + apiKey);

    try {

        String prompt = """
                You are an HR Learning Assistant.

                Employee Role:
                %s

                Assessment Score:
                %d%%

                Current Skills:
                %s

                Missing Skills:
                %s

                Give:
                1. Learning Priority
                2. Courses
                3. Practice Project
                4. Estimated Learning Time

                Keep response below 250 words.
                """
                .formatted(
                        role,
                        score,
                        String.join(", ", currentSkills),
                        String.join(", ", missingSkills));

        Map<String, Object> requestBody =
                Map.of(
                        "contents",
                        List.of(
                                Map.of(
                                        "parts",
                                        List.of(
                                                Map.of("text", prompt)
                                        )
                                )
                        )
                );

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                        + apiKey;

        Map response =
                restClient.post()
                        .uri(url)
                        .body(requestBody)
                        .retrieve()
                        .body(Map.class);

        System.out.println("Response: " + response);

        List candidates = (List) response.get("candidates");
        Map candidate = (Map) candidates.get(0);
        Map content = (Map) candidate.get("content");
        List parts = (List) content.get("parts");
        Map firstPart = (Map) parts.get(0);

        return firstPart.get("text").toString();

    } catch (Exception e) {
        e.printStackTrace();
        return "ERROR: " + e.getMessage();
    }
}
}