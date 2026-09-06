package com.team7.knowledge_gap_platform.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class HuggingFaceService {

    private final RestClient restClient;

    @Value("${huggingface.api.token}")
    private String apiToken;

    @Value("${huggingface.model}")
    private String model;

    public HuggingFaceService() {

        this.restClient = RestClient.builder()
                .baseUrl("https://router.huggingface.co/v1")
                .build();
    }

    public String generateRecommendation(String prompt) {

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", prompt
                        )
                ),
                "stream", false
        );

        Map response = restClient.post()
                .uri("/chat/completions")
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + apiToken
                )
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        if (response == null) {
            throw new RuntimeException(
                    "No response received from Hugging Face"
            );
        }

        List choices = (List) response.get("choices");

        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException(
                    "No recommendation returned by Hugging Face"
            );
        }

        Map firstChoice = (Map) choices.get(0);

        Map message =
                (Map) firstChoice.get("message");

        if (message == null) {
            throw new RuntimeException(
                    "Invalid response from Hugging Face"
            );
        }

        return String.valueOf(
                message.get("content")
        );
    }
}