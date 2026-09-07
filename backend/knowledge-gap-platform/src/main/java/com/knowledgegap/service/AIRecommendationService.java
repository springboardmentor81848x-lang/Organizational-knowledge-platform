package com.knowledgegap.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

@Service
public class AIRecommendationService {

    private final RestClient restClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=";

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

        Map<String, Object> requestBody = createRequestBody(prompt);

        return callGeminiWithRetry(requestBody, "Recommendation");
    }

    // =========================================================
    // Ask AI Question with Personalized Learning Path Context
    // =========================================================

    public String askQuestion(
            String question,
            String learningPath) {

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

        Map<String, Object> requestBody = createRequestBody(prompt);

        return callGeminiWithRetry(requestBody, "Question");
    }

    // =========================================================
    // Create Gemini Request Body
    // =========================================================

    private Map<String, Object> createRequestBody(String prompt) {

        return Map.of(
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
    }

    // =========================================================
    // Gemini API Call with Retry Handling
    // =========================================================

    private String callGeminiWithRetry(
            Map<String, Object> requestBody,
            String requestType) {

        int maxAttempts = 3;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {

            try {

                System.out.println(
                        "Gemini " + requestType +
                        " attempt " + attempt + "/" + maxAttempts
                );

                String url = GEMINI_URL + apiKey;

                Map<String, Object> response =
                        restClient.post()
                                .uri(url)
                                .body(requestBody)
                                .retrieve()
                                .body(Map.class);

                System.out.println(
                        "Gemini " + requestType +
                        " Response: " + response
                );

                return extractResponseText(response);

            } catch (HttpServerErrorException.ServiceUnavailable e) {

                System.err.println(
                        "Gemini service temporarily unavailable. "
                        + "Attempt " + attempt + "/" + maxAttempts
                );

                if (attempt == maxAttempts) {

                    return "AI service is temporarily unavailable. "
                            + "Please try again after a few moments.";
                }

                // Exponential backoff:
                // Attempt 1 -> wait 2 seconds
                // Attempt 2 -> wait 4 seconds

                long waitTime = 2000L * attempt;

                try {
                    Thread.sleep(waitTime);
                } catch (InterruptedException interruptedException) {

                    Thread.currentThread().interrupt();

                    return "AI request was interrupted. "
                            + "Please try again.";
                }

            } catch (Exception e) {

                e.printStackTrace();

                return "Unable to get a response from the AI service. "
                        + "Please try again later.";
            }
        }

        return "AI service is temporarily unavailable. "
                + "Please try again later.";
    }

    // =========================================================
    // Extract Text from Gemini Response
    // =========================================================

    private String extractResponseText(Map<String, Object> response) {

        if (response == null) {
            return "AI returned an empty response.";
        }

        List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) response.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            return "AI did not return any response.";
        }

        Map<String, Object> candidate = candidates.get(0);

        Map<String, Object> content =
                (Map<String, Object>) candidate.get("content");

        if (content == null) {
            return "AI response content is unavailable.";
        }

        List<Map<String, Object>> parts =
                (List<Map<String, Object>>) content.get("parts");

        if (parts == null || parts.isEmpty()) {
            return "AI response text is unavailable.";
        }

        Map<String, Object> firstPart = parts.get(0);

        Object text = firstPart.get("text");

        if (text == null) {
            return "AI response text is unavailable.";
        }

        return text.toString();
    }
}