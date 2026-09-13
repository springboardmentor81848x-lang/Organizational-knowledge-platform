package com.orgskills.intelligence.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.ld.ExternalCourseDTO;
import com.orgskills.intelligence.exception.ExternalProviderException;
import com.orgskills.intelligence.util.DifficultyNormalizer;
import com.orgskills.intelligence.util.DurationNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CourseraProvider implements ExternalCourseProvider {

    private final ObjectMapper objectMapper;
    private final DurationNormalizer durationNormalizer;
    private final DifficultyNormalizer difficultyNormalizer;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final String COURSERA_API_URL = "https://api.coursera.org/api/courses.v1?limit=100&fields=name,description,slug,workload";

    @Override
    public String getProviderName() {
        return "Coursera";
    }

    @Override
    public List<ExternalCourseDTO> fetchCourses(String skillKeyword) {
        log.info("Fetching courses from Coursera public API for skill keyword: {}", skillKeyword);
        List<ExternalCourseDTO> dtos = new ArrayList<>();

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(COURSERA_API_URL))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                // Reported rather than swallowed into an empty list: "the provider is
                // unreachable" and "the provider has nothing for you" are different answers.
                throw new ExternalProviderException(
                        "Coursera answered with HTTP " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode elements = root.path("elements");

            if (!elements.isArray()) {
                return dtos;
            }

            String searchLower = skillKeyword != null ? skillKeyword.trim().toLowerCase() : "";

            for (JsonNode courseNode : elements) {
                String name = courseNode.path("name").asText("").trim();
                String description = courseNode.path("description").asText("").trim();
                String slug = courseNode.path("slug").asText("").trim();
                String workload = courseNode.path("workload").asText("").trim();

                boolean matches = searchLower.isEmpty()
                        || name.toLowerCase().contains(searchLower)
                        || description.toLowerCase().contains(searchLower);

                if (matches && !name.isEmpty()) {
                    String url = slug.isEmpty() ? "https://www.coursera.org" : "https://www.coursera.org/learn/" + slug;
                    Integer hours = durationNormalizer.normalizeToIntegerHours(workload);
                    String diff = difficultyNormalizer.normalizeDifficulty(name + " " + description);

                    ExternalCourseDTO dto = ExternalCourseDTO.builder()
                            .title(name)
                            .description(description)
                            .provider("Coursera")
                            .durationLabel(workload.isEmpty() ? null : workload)
                            .durationHours(hours)
                            .url(url)
                            .difficulty(diff)
                            .skill(skillKeyword)
                            .build();

                    dtos.add(dto);
                }
            }

            log.info("Successfully fetched and matched {} courses from Coursera for keyword '{}'", dtos.size(), skillKeyword);

        } catch (IOException | InterruptedException e) {
            log.error("Failed to fetch courses from Coursera public API: {}", e.getMessage(), e);
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new ExternalProviderException(
                    "Could not reach Coursera: " + e.getClass().getSimpleName()
                            + (e.getMessage() != null ? " - " + e.getMessage() : ""), e);
        }

        return dtos;
    }
}
