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

    // =========================================================
    // Generate Personalized Learning Path
    // =========================================================

    public String generateRecommendation(
            String role,
            List<String> currentSkills,
            List<String> missingSkills,
            int score) {

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
                            String.join(", ", missingSkills)
                    );

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
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="
                            + apiKey;

            Map response =
                    restClient.post()
                            .uri(url)
                            .body(requestBody)
                            .retrieve()
                            .body(Map.class);

            System.out.println("Response: " + response);

            List candidates =
                    (List) response.get("candidates");

            Map candidate =
                    (Map) candidates.get(0);

            Map content =
                    (Map) candidate.get("content");

            List parts =
                    (List) content.get("parts");

            Map firstPart =
                    (Map) parts.get(0);

            return firstPart.get("text").toString();

        } catch (Exception e) {

            e.printStackTrace();

            return "ERROR: " + e.getMessage();
        }
    }


    // =========================================================
    // Ask AI Question
    // =========================================================

    // =========================================================
// Ask AI Question with Personalized Learning Path Context
// =========================================================

public String askQuestion(
        String question,
        String learningPath) {

    try {

        String prompt = """
                You are an HR Learning Assistant.

                The employee has a previously generated
                personalized learning path.

                Previously Generated Learning Path:
                %s

                Employee Question:
                %s

                IMPORTANT INSTRUCTIONS:

                1. Use the personalized learning path as the
                   primary context when answering questions
                   about learning priorities, recommended skills,
                   courses, or what to learn next.

                2. If the employee asks:
                   "Which skill should I focus on first?"
                   recommend the appropriate skill from the
                   personalized learning path.

                3. If the employee asks what they should learn
                   next, follow the order of the personalized
                   learning path whenever possible.

                4. Do not recommend a completely different skill
                   when the answer can be found in the personalized
                   learning path.

                5. For general programming questions unrelated to
                   the learning path, answer normally.

                6. Keep the answer beginner-friendly.

                7. Keep the answer below 250 words.
                """
                .formatted(
                        learningPath,
                        question
                );

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
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="
                        + apiKey;

        Map response =
                restClient.post()
                        .uri(url)
                        .body(requestBody)
                        .retrieve()
                        .body(Map.class);

        System.out.println("Question Response: " + response);

        List candidates =
                (List) response.get("candidates");

        Map candidate =
                (Map) candidates.get(0);

        Map content =
                (Map) candidate.get("content");

        List parts =
                (List) content.get("parts");

        Map firstPart =
                (Map) parts.get(0);

        return firstPart.get("text").toString();

    } catch (Exception e) {

        e.printStackTrace();

        return "ERROR: " + e.getMessage();
    }
}
}