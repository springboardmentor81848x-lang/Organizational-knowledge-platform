package com.orgskills.intelligence.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.recommendation.CourseRecommendationScore;
import com.orgskills.intelligence.dto.recommendation.RecommendationResponse;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.TrainingRecommendation;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.TrainingRecommendationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final UserRepository userRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final TrainingRecommendationRepository recommendationRepository;
    private final RecommendationScoringService recommendationScoringService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    @Value("${app.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Value("${app.openai.base-url:https://api.openai.com/v1/chat/completions}")
    private String openAiBaseUrl;

    @Value("${llm.mock.enabled:true}")
    private boolean mockEnabled;

    private static final String SYSTEM_PROMPT = """
            You are a corporate learning advisor. Given an employee's role, their \
            skill gaps, and pre-ranked top recommended courses, generate personalized, \
            specific, and actionable training recommendations. For each skill gap provided, \
            return ONE recommendation explaining why it matters for their role and what \
            they should focus on first. Be concise (2-3 sentences per recommendation). \
            Respond ONLY with valid JSON in this exact shape:
            
            [
              {
                "skillName": "string",
                "recommendationText": "string",
                "suggestedResourceType": "Course | Article | Practice Project",
                "priorityRank": integer
              }
            ]
            """;

    // ── Public API ──────────────────────────────────────────────────────────────

    @Transactional
    public List<RecommendationResponse> generateRecommendations(Long employeeId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + employeeId));

        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(employeeId);
        if (gaps.isEmpty()) {
            return List.of();
        }

        // Call shared RecommendationScoringService for unified ranking
        List<CourseRecommendationScore> rankedScores = recommendationScoringService.scoreCoursesForEmployee(employeeId);
        Map<Long, CourseRecommendationScore> topScoreBySkillId = rankedScores.stream()
                .collect(Collectors.toMap(
                        cs -> cs.getSkill().getId(),
                        Function.identity(),
                        (a, b) -> a.getScore() >= b.getScore() ? a : b
                ));

        // Resolve recommendation drafts via LLM, mock, or fallback
        List<RecommendationDraft> drafts = resolveDrafts(employee, gaps, rankedScores);

        // Delete old recommendations before saving new ones
        recommendationRepository.deleteByEmployeeId(employeeId);

        // Build a map of skill name → Skill entity for matching LLM output
        Map<String, Skill> skillByName = gaps.stream()
                .map(GapAnalysis::getSkill)
                .collect(Collectors.toMap(
                        s -> s.getName().toLowerCase(),
                        Function.identity(),
                        (a, b) -> a
                ));

        // Build a map of skill name → GapAnalysis for copying severity
        Map<String, GapAnalysis> gapBySkillName = gaps.stream()
                .collect(Collectors.toMap(
                        g -> g.getSkill().getName().toLowerCase(),
                        Function.identity(),
                        (a, b) -> a
                ));

        List<TrainingRecommendation> saved = new ArrayList<>();
        for (RecommendationDraft draft : drafts) {
            String key = draft.skillName().toLowerCase();
            Skill skill = skillByName.get(key);
            GapAnalysis gap = gapBySkillName.get(key);

            if (skill == null || gap == null) {
                log.warn("Skipping recommendation for unmatched skill: {}", draft.skillName());
                continue;
            }

            CourseRecommendationScore scoredCourse = topScoreBySkillId.get(skill.getId());
            double relevanceScore;
            String scoreBreakdown;

            if (scoredCourse != null) {
                relevanceScore = scoredCourse.getScore();
                scoreBreakdown = scoredCourse.getScoreBreakdown();
            } else {
                double scoreMultiplier = gap.getGapScore() * 20.0;
                double severityBonus = switch (gap.getRiskSeverity()) {
                    case CRITICAL -> 30.0;
                    case HIGH -> 20.0;
                    case MEDIUM -> 10.0;
                    case LOW -> 5.0;
                };
                relevanceScore = Math.min(100.0, scoreMultiplier + severityBonus);
                scoreBreakdown = String.format("Gap Severity: %.1f (from gap score %.1f, severity %s)",
                        relevanceScore, gap.getGapScore(), gap.getRiskSeverity().name());
            }

            TrainingRecommendation rec = new TrainingRecommendation();
            rec.setEmployee(employee);
            rec.setSkill(skill);
            rec.setRecommendationText(draft.recommendationText());
            rec.setSuggestedResourceType(draft.suggestedResourceType());
            rec.setPriorityRank(draft.priorityRank());
            rec.setSourceGapSeverity(gap.getRiskSeverity().name());
            rec.setRelevanceScore(Math.round(relevanceScore * 10.0) / 10.0);
            rec.setScoreBreakdown(scoreBreakdown);
            saved.add(recommendationRepository.save(rec));
        }

        notifyNewRecommendations(employee, saved);
        return saved.stream().map(this::toResponse).toList();
    }

    /**
     * Tells the employee that fresh recommendations are waiting. One notification per generation
     * rather than one per row: gaps are recalculated on every assessment, and a notification per
     * recommended course would bury everything else in the feed.
     */
    private void notifyNewRecommendations(User employee, List<TrainingRecommendation> generated) {
        if (generated.isEmpty()) {
            return;
        }

        String skills = generated.stream()
                .map(rec -> rec.getSkill().getName())
                .distinct()
                .limit(3)
                .collect(Collectors.joining(", "));
        String message = generated.size() == 1
                ? "A new training recommendation is available for " + skills + "."
                : generated.size() + " new training recommendations are available, covering " + skills + ".";

        notificationService.createNotification(employee, "New training recommendations",
                message, NotificationType.TRAINING_RECOMMENDATION);
    }

    @Transactional(readOnly = true)
    public List<RecommendationResponse> getByEmployee(Long employeeId) {
        if (!userRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("User not found for id: " + employeeId);
        }
        return recommendationRepository.findByEmployeeIdOrderByPriorityRankAsc(employeeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Draft resolution: mock → LLM → fallback ────────────────────────────────

    private List<RecommendationDraft> resolveDrafts(User employee, List<GapAnalysis> gaps, List<CourseRecommendationScore> rankedScores) {
        if (mockEnabled) {
            log.info("LLM mock mode is enabled — returning mock recommendations");
            return mockRecommendations(employee, gaps);
        }

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            log.warn("OpenAI API key is not configured — using rule-based fallback");
            return fallbackRecommendations(employee, gaps);
        }

        try {
            if (openAiBaseUrl.contains("googleapis.com") || (openAiApiKey != null && openAiApiKey.startsWith("AQ"))) {
                return callGemini(employee, gaps, rankedScores);
            }
            return callOpenAi(employee, gaps, rankedScores);
        } catch (Exception ex) {
            log.error("LLM call failed — falling back to rule-based recommendations", ex);
            return fallbackRecommendations(employee, gaps);
        }
    }

    // ── LLM calls ───────────────────────────────────────────────────────────────

    private List<RecommendationDraft> callGemini(User employee, List<GapAnalysis> gaps, List<CourseRecommendationScore> rankedScores)
            throws IOException, InterruptedException {
        String userMessage = buildUserMessage(employee, gaps, rankedScores);
        String promptText = SYSTEM_PROMPT + "\n\n" + userMessage;

        var requestJson = objectMapper.createObjectNode();
        var contentsNode = objectMapper.createArrayNode();
        var contentObj = objectMapper.createObjectNode();
        contentObj.put("role", "user");
        var partsNode = objectMapper.createArrayNode();
        partsNode.add(objectMapper.createObjectNode().put("text", promptText));
        contentObj.set("parts", partsNode);
        contentsNode.add(contentObj);
        requestJson.set("contents", contentsNode);

        var genConfig = objectMapper.createObjectNode();
        genConfig.put("temperature", 0.3);
        genConfig.put("responseMimeType", "application/json");
        requestJson.set("generationConfig", genConfig);

        String modelName = (openAiModel != null && !openAiModel.isBlank() && openAiModel.contains("gemini"))
                ? openAiModel : "gemini-3.6-flash";

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + openAiApiKey.trim();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestJson)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Gemini API request failed with status " + response.statusCode()
                    + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
        return parseDrafts(content);
    }

    private List<RecommendationDraft> callOpenAi(User employee, List<GapAnalysis> gaps, List<CourseRecommendationScore> rankedScores)
            throws IOException, InterruptedException {
        String userMessage = buildUserMessage(employee, gaps, rankedScores);

        var requestJson = objectMapper.createObjectNode();
        requestJson.put("model", openAiModel);
        requestJson.set("messages", objectMapper.createArrayNode()
                .add(objectMapper.createObjectNode()
                        .put("role", "system")
                        .put("content", SYSTEM_PROMPT))
                .add(objectMapper.createObjectNode()
                        .put("role", "user")
                        .put("content", userMessage)));
        requestJson.put("temperature", 0.3);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(openAiBaseUrl))
                .header("Authorization", "Bearer " + openAiApiKey)
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(30))
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestJson)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("OpenAI request failed with status " + response.statusCode()
                    + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").path(0).path("message").path("content").asText();
        return parseDrafts(content);
    }

    private String buildUserMessage(User employee, List<GapAnalysis> gaps, List<CourseRecommendationScore> rankedScores) {
        StringBuilder sb = new StringBuilder();
        sb.append("Employee role: ").append(employee.getJobTitle())
                .append(" (").append(employee.getDepartment()).append(")\n\n");
        sb.append("Skill gaps:\n");

        List<GapAnalysis> sorted = gaps.stream()
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .toList();

        for (GapAnalysis gap : sorted) {
            sb.append("- Skill: ").append(gap.getSkill().getName())
                    .append(" | Current level: ").append(String.format("%.1f", gap.getCurrentScore()))
                    .append("/5 | Required level: ").append(String.format("%.1f", gap.getTargetScore()))
                    .append("/5 | Severity: ").append(gap.getRiskSeverity().name())
                    .append("\n");
        }

        if (rankedScores != null && !rankedScores.isEmpty()) {
            sb.append("\nPre-ranked Top Recommended Courses:\n");
            rankedScores.stream().limit(5).forEach(cs -> {
                sb.append("- ").append(cs.getCourse().getTitle())
                        .append(" (Skill: ").append(cs.getSkill().getName())
                        .append(", Provider: ").append(cs.getCourse().getProvider())
                        .append(", Score: ").append(cs.getScore())
                        .append(")\n");
            });
        }

        return sb.toString();
    }

    // ── JSON parsing ────────────────────────────────────────────────────────────

    private List<RecommendationDraft> parseDrafts(String content) throws IOException {
        String normalized = content.trim();
        // Strip markdown code fences if present
        if (!normalized.startsWith("[")) {
            int start = normalized.indexOf('[');
            int end = normalized.lastIndexOf(']');
            if (start >= 0 && end > start) {
                normalized = normalized.substring(start, end + 1);
            }
        }

        JsonNode array = objectMapper.readTree(normalized);
        List<RecommendationDraft> drafts = new ArrayList<>();
        if (!array.isArray()) {
            throw new IOException("Expected JSON array from LLM response");
        }

        for (JsonNode node : array) {
            String skillName = node.path("skillName").asText("").trim();
            String text = node.path("recommendationText").asText("").trim();
            String resourceType = node.path("suggestedResourceType").asText("Course").trim();
            int rank = node.path("priorityRank").asInt(drafts.size() + 1);

            if (skillName.isEmpty() || text.isEmpty()) {
                continue;
            }

            drafts.add(new RecommendationDraft(skillName, text, resourceType, rank));
        }

        if (drafts.isEmpty()) {
            throw new IOException("LLM response did not contain valid recommendations");
        }
        return drafts;
    }

    // ── Mock mode ───────────────────────────────────────────────────────────────

    private List<RecommendationDraft> mockRecommendations(User employee, List<GapAnalysis> gaps) {
        List<GapAnalysis> sorted = gaps.stream()
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .toList();

        List<RecommendationDraft> drafts = new ArrayList<>();
        int rank = 1;
        for (GapAnalysis gap : sorted) {
            String skillName = gap.getSkill().getName();
            String severity = gap.getRiskSeverity().name();
            String resourceType = determineResourceType(gap.getGapScore());

            String text = String.format(
                    "As a %s, strengthening your %s proficiency is essential. "
                            + "Your current level (%.1f/5) is %.1f points below the required level (%.1f/5). "
                            + "Start with a structured %s focusing on practical, role-relevant %s applications.",
                    employee.getJobTitle(), skillName,
                    gap.getCurrentScore(), gap.getGapScore(), gap.getTargetScore(),
                    resourceType.toLowerCase(), skillName.toLowerCase()
            );

            drafts.add(new RecommendationDraft(skillName, text, resourceType, rank++));
        }
        return drafts;
    }

    // ── Rule-based fallback ─────────────────────────────────────────────────────

    private List<RecommendationDraft> fallbackRecommendations(User employee, List<GapAnalysis> gaps) {
        List<GapAnalysis> sorted = gaps.stream()
                .sorted(Comparator.comparing(GapAnalysis::getGapScore).reversed())
                .toList();

        List<RecommendationDraft> drafts = new ArrayList<>();
        int rank = 1;
        for (GapAnalysis gap : sorted) {
            String skillName = gap.getSkill().getName();
            String resourceType = determineResourceType(gap.getGapScore());

            String text = String.format(
                    "Focus on %s: you are %.1f levels below the required proficiency for %s. "
                            + "Start with foundational %s to close this %s-severity gap.",
                    skillName, gap.getGapScore(), employee.getJobTitle(),
                    resourceType.toLowerCase(), gap.getRiskSeverity().name().toLowerCase()
            );

            drafts.add(new RecommendationDraft(skillName, text, resourceType, rank++));
        }
        return drafts;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private String determineResourceType(double gapScore) {
        if (gapScore >= 3.0) return "Course";
        if (gapScore >= 1.5) return "Article";
        return "Practice Project";
    }

    private RecommendationResponse toResponse(TrainingRecommendation rec) {
        return RecommendationResponse.builder()
                .id(rec.getId())
                .employeeId(rec.getEmployee().getId())
                .skillId(rec.getSkill().getId())
                .skillName(rec.getSkill().getName())
                .recommendationText(rec.getRecommendationText())
                .suggestedResourceType(rec.getSuggestedResourceType())
                .priorityRank(rec.getPriorityRank())
                .sourceGapSeverity(rec.getSourceGapSeverity())
                .relevanceScore(rec.getRelevanceScore())
                .scoreBreakdown(rec.getScoreBreakdown())
                .generatedAt(rec.getGeneratedAt())
                .build();
    }

    private record RecommendationDraft(
            String skillName,
            String recommendationText,
            String suggestedResourceType,
            int priorityRank
    ) {
    }
}
