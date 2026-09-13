package com.orgskills.intelligence.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/**
 * The one place the platform talks to a language model.
 *
 * <p>Two callers share it — training recommendations and the assistant — and they need different
 * shapes out of the same provider: recommendations want a JSON array they can parse into rows,
 * the assistant wants prose across a multi-turn conversation. Both wants are served here so the
 * provider routing, the API key handling and the request/response shapes live once.
 *
 * <h2>Why two request shapes</h2>
 * The configured base URL defaults to Gemini's OpenAI-compatible endpoint, but the native Gemini
 * API is what actually honours {@code responseMimeType} for reliable JSON. So a Google endpoint
 * (or a Google-issued key) is sent the native Gemini shape and everything else the OpenAI chat
 * shape. This mirrors the routing that recommendations relied on before it moved here.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LlmClient {

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Value("${app.openai.api-key:}")
    private String apiKey;

    @Value("${app.openai.model:gpt-4o-mini}")
    private String model;

    @Value("${app.openai.base-url:https://api.openai.com/v1/chat/completions}")
    private String baseUrl;

    @Value("${llm.mock.enabled:true}")
    private boolean mockEnabled;

    /** One message in a conversation. {@code role} is either {@code user} or {@code assistant}. */
    public record Turn(String role, String content) {

        public static Turn user(String content) {
            return new Turn("user", content);
        }

        public static Turn assistant(String content) {
            return new Turn("assistant", content);
        }

        public boolean isAssistant() {
            return "assistant".equalsIgnoreCase(role);
        }
    }

    /**
     * Whether a real model will actually be called. False when mock mode is on or no key is
     * configured, which is the out-of-the-box state — callers are expected to have their own
     * answer ready for that case rather than failing.
     */
    public boolean isLive() {
        return !mockEnabled && apiKey != null && !apiKey.isBlank();
    }

    /** True when mock mode is switched on, as distinct from simply having no key configured. */
    public boolean isMockEnabled() {
        return mockEnabled;
    }

    /** A single-shot completion constrained to return JSON. */
    public String completeJson(String systemPrompt, String userMessage)
            throws IOException, InterruptedException {
        return send(systemPrompt, List.of(Turn.user(userMessage)), true);
    }

    /** A prose completion over a conversation, oldest turn first. */
    public String completeText(String systemPrompt, List<Turn> turns)
            throws IOException, InterruptedException {
        return send(systemPrompt, turns, false);
    }

    private String send(String systemPrompt, List<Turn> turns, boolean jsonMode)
            throws IOException, InterruptedException {
        if (usesGemini()) {
            return callGemini(systemPrompt, turns, jsonMode);
        }
        return callOpenAiCompatible(systemPrompt, turns, jsonMode);
    }

    private boolean usesGemini() {
        return baseUrl.contains("googleapis.com") || (apiKey != null && apiKey.startsWith("AQ"));
    }

    // ── Gemini native ───────────────────────────────────────────────────────────

    private String callGemini(String systemPrompt, List<Turn> turns, boolean jsonMode)
            throws IOException, InterruptedException {
        ObjectNode requestJson = objectMapper.createObjectNode();

        // The system prompt travels as systemInstruction rather than as a leading user turn, so
        // it keeps its standing across a long conversation instead of ageing out as history grows.
        ObjectNode systemInstruction = objectMapper.createObjectNode();
        systemInstruction.set("parts", objectMapper.createArrayNode()
                .add(objectMapper.createObjectNode().put("text", systemPrompt)));
        requestJson.set("systemInstruction", systemInstruction);

        ArrayNode contents = objectMapper.createArrayNode();
        for (Turn turn : turns) {
            ObjectNode content = objectMapper.createObjectNode();
            content.put("role", turn.isAssistant() ? "model" : "user");
            content.set("parts", objectMapper.createArrayNode()
                    .add(objectMapper.createObjectNode().put("text", turn.content())));
            contents.add(content);
        }
        requestJson.set("contents", contents);

        ObjectNode generationConfig = objectMapper.createObjectNode();
        generationConfig.put("temperature", jsonMode ? 0.3 : 0.4);
        if (jsonMode) {
            generationConfig.put("responseMimeType", "application/json");
        }
        requestJson.set("generationConfig", generationConfig);

        String modelName = (model != null && !model.isBlank() && model.contains("gemini"))
                ? model : "gemini-3.6-flash";
        String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                + modelName + ":generateContent";

        // The key goes in a header, not the query string: URLs land in proxy and server logs.
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey.trim())
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestJson)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Gemini API request failed with status " + response.statusCode()
                    + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String text = root.path("candidates").path(0).path("content").path("parts").path(0)
                .path("text").asText("");
        if (text.isBlank()) {
            throw new IOException("Gemini API returned no content");
        }
        return text;
    }

    // ── OpenAI-compatible ───────────────────────────────────────────────────────

    private String callOpenAiCompatible(String systemPrompt, List<Turn> turns, boolean jsonMode)
            throws IOException, InterruptedException {
        ObjectNode requestJson = objectMapper.createObjectNode();
        requestJson.put("model", model);

        ArrayNode messages = objectMapper.createArrayNode();
        messages.add(objectMapper.createObjectNode()
                .put("role", "system")
                .put("content", systemPrompt));
        for (Turn turn : turns) {
            messages.add(objectMapper.createObjectNode()
                    .put("role", turn.isAssistant() ? "assistant" : "user")
                    .put("content", turn.content()));
        }
        requestJson.set("messages", messages);
        requestJson.put("temperature", jsonMode ? 0.3 : 0.4);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestJson)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("LLM request failed with status " + response.statusCode()
                    + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String text = root.path("choices").path(0).path("message").path("content").asText("");
        if (text.isBlank()) {
            throw new IOException("LLM returned no content");
        }
        return text;
    }
}
