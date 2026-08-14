package com.knowledgeiq.service;

import com.knowledgeiq.dto.AiChatResponseDto;
import com.knowledgeiq.dto.SkillGapDto;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private CourseEnrollmentRepository enrollmentRepository;

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentResponseRepository assessmentResponseRepository;

    @Autowired
    private NotificationService notificationService;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> getOnboardingSuggestions(String domain) {
        if (domain == null || domain.trim().isEmpty()) {
            domain = "Software Engineer";
        }

        Map<String, Object> rawData;

        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("${")) {
            try {
                rawData = callGeminiApi(domain);
            } catch (Exception e) {
                System.err.println("Gemini API call failed, using high-quality local fallback: " + e.getMessage());
                rawData = getLocalFallbackSuggestions(domain);
            }
        } else {
            rawData = getLocalFallbackSuggestions(domain);
        }

        return syncSuggestionsWithDatabase(rawData);
    }

    public AiChatResponseDto chatWithAi(User currentUser, String userMessage, String courseContext) {
        if (currentUser == null) {
            return new AiChatResponseDto("Please log in to chat with your AI Learning Assistant.", Collections.emptyMap(), Collections.emptyList());
        }

        String roleTitle = (currentUser.getRole() != null) ? currentUser.getRole().getTitle() : "Software Engineer";
        String deptName = (currentUser.getDepartment() != null) ? currentUser.getDepartment().getName() : "Engineering";
        
        List<SkillGapDto> gaps = gapAnalysisService.calculateUserGaps(currentUser.getId());
        List<EmployeeSkill> skills = employeeSkillRepository.findByUserId(currentUser.getId());
        List<CourseEnrollment> enrollments = enrollmentRepository.findByUserId(currentUser.getId());

        // Calculate skill score and top priority gap
        int totalCurrent = 0;
        int totalRequired = 0;
        SkillGapDto topGap = null;
        int maxGapPct = -1;

        for (SkillGapDto g : gaps) {
            totalCurrent += g.getCurrentLevel();
            totalRequired += g.getRequiredLevel();
            int gapPct = g.getRequiredLevel() > 0 ? (int) Math.round(((double) (g.getRequiredLevel() - g.getCurrentLevel()) / g.getRequiredLevel()) * 100) : 0;
            if (gapPct > maxGapPct) {
                maxGapPct = gapPct;
                topGap = g;
            }
        }

        int skillScore = totalRequired > 0 ? (int) Math.round(((double) totalCurrent / totalRequired) * 100) : 0;
        int gapPercent = 100 - skillScore;
        String topPrioritySkill = topGap != null ? topGap.getSkillName() : "Core Domain Skills";

        Map<String, Object> userSummary = Map.of(
                "roleTitle", roleTitle,
                "skillScore", skillScore,
                "gapPercent", gapPercent,
                "topPrioritySkill", topPrioritySkill
        );

        // Try Gemini API chat first if key exists
        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("${")) {
            try {
                String aiReply = callGeminiChatApi(currentUser, roleTitle, deptName, skills, gaps, enrollments, userMessage, courseContext);
                return new AiChatResponseDto(aiReply, userSummary, Collections.emptyList());
            } catch (Exception e) {
                System.err.println("Gemini Chat API call failed, using rule engine response: " + e.getMessage());
            }
        }

        // Context-aware fallback response engine
        String fallbackReply = generateFallbackChatReply(currentUser.getFullName(), roleTitle, skills, gaps, userMessage, courseContext, topPrioritySkill, maxGapPct);
        return new AiChatResponseDto(fallbackReply, userSummary, Collections.emptyList());
    }

    private String callGeminiChatApi(User user, String roleTitle, String deptName, List<EmployeeSkill> skills, List<SkillGapDto> gaps, List<CourseEnrollment> enrollments, String userMessage, String courseContext) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        StringBuilder skillsContext = new StringBuilder();
        for (EmployeeSkill es : skills) {
            skillsContext.append(String.format("- %s: Level %d/5\n", es.getSkill().getName(), es.getProficiencyLevel()));
        }

        StringBuilder gapsContext = new StringBuilder();
        for (SkillGapDto g : gaps) {
            int pct = g.getRequiredLevel() > 0 ? (int) Math.round(((double) (g.getRequiredLevel() - g.getCurrentLevel()) / g.getRequiredLevel()) * 100) : 0;
            gapsContext.append(String.format("- %s: Current %d/5 vs Required %d/5 (Gap: %d%%)\n", g.getSkillName(), g.getCurrentLevel(), g.getRequiredLevel(), pct));
        }

        String prompt = String.format(
            "You are KnowledgeIQ AI Assistant, a personal learning mentor.\n" +
            "User Profile: Name=%s, Role=%s, Department=%s\n\n" +
            "USER'S RATED SKILLS:\n%s\n" +
            "USER'S ROLE BENCHMARKS & SKILL GAPS:\n%s\n" +
            (courseContext != null ? "SPECIFIC COURSE CONTEXT: " + courseContext + "\n\n" : "") +
            "User Question: \"%s\"\n\n" +
            "Answer the question directly based on their REAL role benchmarks and calculated skill gaps. Be encouraging, structured, and action-oriented. Use clear markdown headers or bullet points.",
            user.getFullName(), roleTitle, deptName,
            skillsContext.length() > 0 ? skillsContext.toString() : "- None rated yet\n",
            gapsContext.length() > 0 ? gapsContext.toString() : "- None benchmarked yet\n",
            userMessage
        );

        Map<String, Object> contentPart = Map.of("text", prompt);
        Map<String, Object> partContainer = Map.of("parts", List.of(contentPart));
        Map<String, Object> contents = Map.of("contents", List.of(partContainer));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contents, headers);

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(url, requestEntity, String.class);
        if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
            Map<String, Object> apiResponse = objectMapper.readValue(responseEntity.getBody(), Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) apiResponse.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        }
        throw new RuntimeException("Empty response from Gemini Chat API");
    }

    private String generateFallbackChatReply(String name, String roleTitle, List<EmployeeSkill> skills, List<SkillGapDto> gaps, String message, String courseContext, String topPrioritySkill, int maxGapPct) {
        String msgLower = message.toLowerCase();

        if (courseContext != null && !courseContext.isBlank()) {
            return String.format("### 🎯 Recommendations for %s\n\n" +
                    "This course directly addresses your **%s** gap for your **%s** role benchmark.\n\n" +
                    "- **Target Skill:** %s\n" +
                    "- **Gap Severity:** %s\n" +
                    "- **Impact:** Completing this module will raise your overall skill score by up to 15%%.\n\n" +
                    "I recommend spending **2–3 weeks** on hands-on exercises to master this competency.",
                    courseContext, topPrioritySkill, roleTitle, topPrioritySkill, maxGapPct > 50 ? "Critical" : "High");
        }

        if (msgLower.contains("biggest") || msgLower.contains("highest") || msgLower.contains("priority") || msgLower.contains("weakest")) {
            return String.format("### 🚨 Your Highest Priority Skill Gap: **%s**\n\n" +
                    "Based on your profile as a **%s**, your largest calculated gap is in **%s** (%d%% gap).\n\n" +
                    "**Why this matters:**\n" +
                    "Your role benchmark requires higher proficiency in %s to execute key responsibilities effectively.\n\n" +
                    "**Next Action:** Start with foundational modules for %s in your recommended learning path below.",
                    topPrioritySkill, roleTitle, topPrioritySkill, maxGapPct > 0 ? maxGapPct : 50, topPrioritySkill, topPrioritySkill);
        }

        if (msgLower.contains("next") || msgLower.contains("learn") || msgLower.contains("recommend") || msgLower.contains("plan")) {
            return String.format("### 🎓 Recommended Learning Path for **%s**\n\n" +
                    "Here is your personalized sequence to close your top skill gaps:\n\n" +
                    "1. **%s (Priority: HIGH)** — Address your %d%% gap.\n" +
                    "2. **Domain Architecture & Best Practices** — Build core competency.\n" +
                    "3. **Hands-on Micro-learning Sprints** — Validate skills with practical assessments.\n\n" +
                    "Focusing on **%s** first will yield the highest performance improvement for your role!",
                    roleTitle, topPrioritySkill, maxGapPct > 0 ? maxGapPct : 50, topPrioritySkill);
        }

        return String.format("Hello %s! I'm your AI Learning Assistant.\n\n" +
                "As a **%s**, your current top focus area is **%s** (%d%% gap remaining).\n\n" +
                "You can ask me questions such as:\n" +
                "- *\"What is my biggest skill gap?\"*\n" +
                "- *\"Why should I learn %s first?\"*\n" +
                "- *\"Create a 3-week learning plan for me.\"*",
                name != null ? name : "there", roleTitle, topPrioritySkill, maxGapPct > 0 ? maxGapPct : 50, topPrioritySkill);
    }

    private Map<String, Object> callGeminiApi(String domain) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        String prompt = String.format(
            "For the professional role/domain named \"%s\", generate exactly 5 core technical skills that are essential to master. " +
            "Return the output as a valid JSON object matching this schema: " +
            "{\"skills\": [{\"name\": \"Skill Name\", \"expectedLevel\": 4}, ...]}. " +
            "Do not include markdown code block formatting (like ```json), just return the raw JSON string.",
            domain
        );

        Map<String, Object> contentPart = Map.of("text", prompt);
        Map<String, Object> partContainer = Map.of("parts", List.of(contentPart));
        Map<String, Object> contents = Map.of("contents", List.of(partContainer));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contents, headers);

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(url, requestEntity, String.class);
        if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
            Map<String, Object> apiResponse = objectMapper.readValue(responseEntity.getBody(), Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) apiResponse.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        text = text.trim();
                        if (text.startsWith("```")) {
                            text = text.substring(text.indexOf("\n") + 1);
                        }
                        if (text.endsWith("```")) {
                            text = text.substring(0, text.lastIndexOf("```"));
                        }
                        text = text.trim();
                        return objectMapper.readValue(text, Map.class);
                    }
                }
            }
        }
        throw new RuntimeException("Unexpected response structure from Gemini API");
    }

    private Map<String, Object> syncSuggestionsWithDatabase(Map<String, Object> rawData) {
        List<Map<String, Object>> rawSkills = (List<Map<String, Object>>) rawData.get("skills");

        SkillCategory category = skillCategoryRepository.findAll().stream().findFirst().orElseGet(() -> {
            SkillCategory cat = new SkillCategory();
            cat.setName("Technical");
            cat.setDescription("AI-suggested Technical Skills");
            return skillCategoryRepository.save(cat);
        });

        List<Map<String, Object>> syncedSkills = new ArrayList<>();
        if (rawSkills != null) {
            for (Map<String, Object> rawSkillMap : rawSkills) {
                String skillName = (String) rawSkillMap.get("name");
                Integer expectedLevel = (Integer) rawSkillMap.get("expectedLevel");

                Skill skill = skillRepository.findAllByName(skillName).stream().findFirst()
                        .orElseGet(() -> {
                            Skill s = new Skill();
                            s.setName(skillName);
                            s.setCategory(category);
                            s.setDescription("AI Suggested Skill for domain");
                            return skillRepository.save(s);
                        });
                
                Map<String, Object> skillInfo = new HashMap<>();
                skillInfo.put("skillId", skill.getId().toString());
                skillInfo.put("name", skill.getName());
                skillInfo.put("expectedLevel", expectedLevel);
                syncedSkills.add(skillInfo);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("skills", syncedSkills);
        return result;
    }

    private Map<String, Object> getLocalFallbackSuggestions(String domain) {
        String cleanDomain = domain.toLowerCase().trim();
        List<Map<String, Object>> skills = new ArrayList<>();

        if (cleanDomain.contains("devops") || cleanDomain.contains("infrastructure") || cleanDomain.contains("site reliability")) {
            skills = Arrays.asList(
                createSkillMap("Linux", 4), createSkillMap("Git", 4), createSkillMap("Docker", 4),
                createSkillMap("Kubernetes", 4), createSkillMap("CI/CD", 4), createSkillMap("Terraform", 3),
                createSkillMap("Ansible", 3), createSkillMap("Cloud/AWS", 3)
            );
        } else if (cleanDomain.contains("design") || cleanDomain.contains("ux") || cleanDomain.contains("ui") || cleanDomain.contains("product designer")) {
            skills = Arrays.asList(
                createSkillMap("Figma", 4), createSkillMap("UI/UX Design", 4), createSkillMap("Wireframing", 3),
                createSkillMap("User Research", 3), createSkillMap("Interaction Design", 3), createSkillMap("Typography", 3)
            );
        } else if (cleanDomain.contains("sales") || cleanDomain.contains("business development") || cleanDomain.contains("sales executive")) {
            skills = Arrays.asList(
                createSkillMap("Sales Pipeline", 4), createSkillMap("Negotiation", 4), createSkillMap("CRM Tools", 3),
                createSkillMap("Presentation", 3), createSkillMap("Lead Generation", 3), createSkillMap("Communication", 4)
            );
        } else if (cleanDomain.contains("data") || cleanDomain.contains("sql") || cleanDomain.contains("analytics") || cleanDomain.contains("python")) {
            skills = Arrays.asList(
                createSkillMap("SQL", 4), createSkillMap("Python", 4), createSkillMap("Data Analytics", 4),
                createSkillMap("Excel", 3), createSkillMap("Tableau", 3), createSkillMap("Communication", 3)
            );
        } else if (cleanDomain.contains("java") || cleanDomain.contains("backend") || cleanDomain.contains("spring")) {
            skills = Arrays.asList(
                createSkillMap("Java Spring Boot", 4), createSkillMap("SQL", 4), createSkillMap("System Design", 4),
                createSkillMap("Cloud/AWS", 3), createSkillMap("Security", 3)
            );
        } else {
            skills = Arrays.asList(
                createSkillMap("Git", 4), createSkillMap("SQL", 3), createSkillMap("System Design", 4),
                createSkillMap("JavaScript", 4), createSkillMap("Security", 3), createSkillMap("Communication", 3)
            );
        }

        Map<String, Object> result = new HashMap<>();
        result.put("skills", skills);
        return result;
    }

    private Map<String, Object> createSkillMap(String name, int expectedLevel) {
        Map<String, Object> skill = new HashMap<>();
        skill.put("name", name);
        skill.put("expectedLevel", expectedLevel);
        return skill;
    }

    public Map<String, Object> generateAiAssessment(String domain, String difficulty, Integer questionCount) {
        if (domain == null || domain.trim().isEmpty()) domain = "Data Analytics";
        if (difficulty == null || difficulty.trim().isEmpty()) difficulty = "Intermediate";
        if (questionCount == null || questionCount < 3) questionCount = 5;

        Map<String, Object> assessmentData = null;

        if (apiKey != null && !apiKey.trim().isEmpty() && !apiKey.startsWith("${")) {
            try {
                assessmentData = callGeminiGenerateAssessmentApi(domain, difficulty, questionCount);
            } catch (Exception e) {
                System.err.println("Gemini Assessment Generation failed, using local domain generator: " + e.getMessage());
                assessmentData = getFallbackAiAssessment(domain, difficulty, questionCount);
            }
        } else {
            assessmentData = getFallbackAiAssessment(domain, difficulty, questionCount);
        }

        return assessmentData;
    }

    private Map<String, Object> callGeminiGenerateAssessmentApi(String domain, String difficulty, int count) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        String prompt = String.format(
            "You are an expert technical interviewer and assessment engine for KnowledgeIQ.\n" +
            "Generate exactly %d multiple-choice test questions for the domain/topic: \"%s\" at difficulty level: \"%s\".\n" +
            "Return a valid JSON object matching this exact schema:\n" +
            "{\n" +
            "  \"domain\": \"%s\",\n" +
            "  \"difficulty\": \"%s\",\n" +
            "  \"questions\": [\n" +
            "    {\n" +
            "      \"id\": \"q1\",\n" +
            "      \"questionText\": \"Clear conceptual or practical question\",\n" +
            "      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n" +
            "      \"correctOptionIndex\": 0,\n" +
            "      \"explanation\": \"Detailed technical rationale why this option is correct\",\n" +
            "      \"targetSkill\": \"Specific skill name like SQL or React\",\n" +
            "      \"difficulty\": \"%s\"\n" +
            "    }\n" +
            "  ]\n" +
            "}\n" +
            "Do not include markdown code formatting (like ```json), just return the raw JSON string.",
            count, domain, difficulty, domain, difficulty, difficulty
        );

        Map<String, Object> contentPart = Map.of("text", prompt);
        Map<String, Object> partContainer = Map.of("parts", List.of(contentPart));
        Map<String, Object> contents = Map.of("contents", List.of(partContainer));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contents, headers);

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(url, requestEntity, String.class);
        if (responseEntity.getStatusCode() == HttpStatus.OK && responseEntity.getBody() != null) {
            Map<String, Object> apiResponse = objectMapper.readValue(responseEntity.getBody(), Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) apiResponse.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        text = text.trim();
                        if (text.startsWith("```")) {
                            text = text.substring(text.indexOf("\n") + 1);
                        }
                        if (text.endsWith("```")) {
                            text = text.substring(0, text.lastIndexOf("```"));
                        }
                        text = text.trim();
                        return objectMapper.readValue(text, Map.class);
                    }
                }
            }
        }
        throw new RuntimeException("Unexpected response from Gemini Assessment API");
    }

    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> evaluateAiAssessment(User user, Map<String, Object> submissionPayload) {
        String domain = (String) submissionPayload.getOrDefault("domain", "Domain Assessment");
        String difficulty = (String) submissionPayload.getOrDefault("difficulty", "Intermediate");
        List<Map<String, Object>> responses = (List<Map<String, Object>>) submissionPayload.get("responses");

        if (responses == null) responses = Collections.emptyList();

        int totalQuestions = responses.size();
        int correctCount = 0;
        Map<String, int[]> skillStats = new HashMap<>(); // skillName -> [correct, total]

        List<Map<String, Object>> evaluatedQuestions = new ArrayList<>();

        for (Map<String, Object> resp : responses) {
            String questionText = (String) resp.get("questionText");
            String targetSkill = (String) resp.getOrDefault("targetSkill", domain);
            int selected = (resp.get("selectedOption") instanceof Number) ? ((Number) resp.get("selectedOption")).intValue() : -1;
            int correct = (resp.get("correctOptionIndex") instanceof Number) ? ((Number) resp.get("correctOptionIndex")).intValue() : 0;
            List<String> options = (List<String>) resp.get("options");
            String explanation = (String) resp.getOrDefault("explanation", "Correct answer is " + (options != null && correct < options.size() ? options.get(correct) : "option " + (correct + 1)));

            boolean isCorrect = (selected == correct);
            if (isCorrect) correctCount++;

            skillStats.computeIfAbsent(targetSkill, k -> new int[]{0, 0});
            skillStats.get(targetSkill)[1]++;
            if (isCorrect) skillStats.get(targetSkill)[0]++;

            Map<String, Object> item = new HashMap<>(resp);
            item.put("isCorrect", isCorrect);
            evaluatedQuestions.add(item);
        }

        double scorePercentage = totalQuestions > 0 ? Math.round(((double) correctCount / totalQuestions) * 100.0) : 0.0;
        String grade = scorePercentage >= 80 ? "EXPERT (Distinction)" : scorePercentage >= 60 ? "ADVANCED (Pass)" : scorePercentage >= 40 ? "INTERMEDIATE" : "NOVICE (Needs Improvement)";

        // 1. Create Assessment Record in DB
        Assessment assessment = new Assessment();
        assessment.setUser(user);
        assessment.setTitle("AI Assessment: " + domain + " (" + difficulty + ")");
        assessment.setType(AssessmentType.SELF_ASSESSMENT);
        assessment.setStatus(AssessmentStatus.COMPLETED);
        assessment.setOverallScore(scorePercentage);
        assessment.setSubmittedAt(ZonedDateTime.now());
        assessment = assessmentRepository.save(assessment);

        // 2. Update Employee Skills & Assessment Responses
        SkillCategory category = skillCategoryRepository.findAll().stream().findFirst().orElse(null);
        Map<String, Integer> skillProficiencyMap = new HashMap<>();

        for (Map.Entry<String, int[]> entry : skillStats.entrySet()) {
            String sName = entry.getKey();
            int[] stats = entry.getValue();
            double skillAccuracy = (double) stats[0] / stats[1];
            int assessedProficiency = skillAccuracy >= 0.8 ? 5 : skillAccuracy >= 0.6 ? 4 : skillAccuracy >= 0.4 ? 3 : 2;

            skillProficiencyMap.put(sName, assessedProficiency);

            Skill skill = skillRepository.findAllByName(sName).stream().findFirst().orElseGet(() -> {
                Skill s = new Skill();
                s.setName(sName);
                s.setCategory(category);
                s.setDescription("AI Verified Skill for " + domain);
                return skillRepository.save(s);
            });

            // Save Response
            AssessmentResponse ar = new AssessmentResponse();
            ar.setAssessment(assessment);
            ar.setSkill(skill);
            ar.setProficiencyLevel(assessedProficiency);
            ar.setNotes("AI Verified: " + stats[0] + "/" + stats[1] + " correct (" + (int) (skillAccuracy * 100) + "%)");
            assessmentResponseRepository.save(ar);

            // Update EmployeeSkill
            EmployeeSkill es = employeeSkillRepository.findByUserIdAndSkillId(user.getId(), skill.getId()).orElseGet(() -> {
                EmployeeSkill newEs = new EmployeeSkill();
                newEs.setUser(user);
                newEs.setSkill(skill);
                return newEs;
            });
            es.setProficiencyLevel(assessedProficiency);
            employeeSkillRepository.save(es);
        }

        // 3. Recalculate Gaps
        gapAnalysisService.recalculateUserGaps(user.getId());

        // 4. Send Notification
        String notifMsg = String.format("You scored %d%% on your AI %s test (%d/%d correct). Your skill proficiencies have been updated.",
                (int) scorePercentage, domain, correctCount, totalQuestions);
        notificationService.createNotification(user, "RECOMMENDATION", "AI Assessment Complete", notifMsg,
                scorePercentage >= 70 ? "LOW" : "HIGH", "ASSESSMENT", assessment.getId().toString(), "/assessments");

        // 5. Generate AI Feedback Summary
        String feedbackSummary = generateAiEvaluationFeedback(domain, scorePercentage, grade, correctCount, totalQuestions, skillStats);

        Map<String, Object> result = new HashMap<>();
        result.put("assessmentId", assessment.getId().toString());
        result.put("domain", domain);
        result.put("difficulty", difficulty);
        result.put("overallScore", scorePercentage);
        result.put("grade", grade);
        result.put("correctCount", correctCount);
        result.put("totalQuestions", totalQuestions);
        result.put("evaluatedQuestions", evaluatedQuestions);
        result.put("skillProficiencies", skillProficiencyMap);
        result.put("aiFeedback", feedbackSummary);

        return result;
    }

    private String generateAiEvaluationFeedback(String domain, double scorePct, String grade, int correct, int total, Map<String, int[]> skillStats) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("### 🤖 Gemini AI Performance Feedback — %s\n\n", domain));
        sb.append(String.format("**Overall Score:** %.0f%% (%s) — Answered %d out of %d questions correctly.\n\n", scorePct, grade, correct, total));

        if (scorePct >= 80) {
            sb.append("🎉 **Key Strengths:** You demonstrated strong mastery of core concepts. Excellent understanding of domain architecture and syntax.\n\n");
            sb.append("🚀 **Next Recommendation:** Advance to leadership-level projects or take a 360° peer review to validate your proficiency.");
        } else if (scorePct >= 60) {
            sb.append("👍 **Good Performance:** You have a solid grasp of foundational concepts, with minor gaps in advanced edge cases.\n\n");
            sb.append("💡 **Focus Area:** Review the recommended micro-learning courses in your training portal to push your proficiency to Level 5.");
        } else {
            sb.append("⚠️ **Growth Opportunities Identified:** Core gaps were detected in key domain competencies.\n\n");
            sb.append("📚 **Action Plan:** Complete the foundational micro-learning sprint recommended in your AI Recommendations tab before re-taking this assessment.");
        }

        return sb.toString();
    }

    private Map<String, Object> getFallbackAiAssessment(String domain, String difficulty, int count) {
        String clean = domain.toLowerCase();
        List<Map<String, Object>> questions = new ArrayList<>();

        if (clean.contains("data") || clean.contains("sql") || clean.contains("analytics") || clean.contains("python")) {
            questions.add(createQuestion("q1", "What is the primary function of the SQL HAVING clause?",
                    Arrays.asList("Filter rows before grouping", "Filter groups formed by GROUP BY clause", "Sort result set in descending order", "Join two tables on primary key"), 1,
                    "HAVING is used to filter aggregated group records, whereas WHERE filters individual rows prior to aggregation.", "SQL", difficulty));
            questions.add(createQuestion("q2", "In pandas / Data Analytics, which method handles missing NaN values effectively?",
                    Arrays.asList("df.fillna() or df.dropna()", "df.clean_nulls()", "df.remove_nan()", "df.filter_empty()"), 0,
                    "fillna() replaces missing NaN values with specified data or statistics, while dropna() removes rows containing NaN.", "Data Analytics", difficulty));
            questions.add(createQuestion("q3", "What distinguishes INNER JOIN from LEFT JOIN in relational databases?",
                    Arrays.asList("INNER JOIN returns all rows from left table regardless of match", "LEFT JOIN returns all rows from left table and matching rows from right table", "They produce identical results in ANSI SQL", "INNER JOIN includes null values from both tables"), 1,
                    "LEFT JOIN retains all rows from the left table regardless of whether a matching record exists in the right table.", "SQL", difficulty));
            questions.add(createQuestion("q4", "Which chart type is best suited to display data distribution and quartiles?",
                    Arrays.asList("Pie Chart", "Box Plot (Box-and-Whisker)", "Line Graph", "Donut Chart"), 1,
                    "Box plots visually depict five-number statistical summaries: minimum, lower quartile, median, upper quartile, and maximum.", "Data Analytics", difficulty));
            questions.add(createQuestion("q5", "What is the key advantage of using CTEs (Common Table Expressions) with WITH clause?",
                    Arrays.asList("Increases query execution speed by 10x", "Improves query readability and enables recursive querying", "Permanently indexes the target table", "Bypasses database security permissions"), 1,
                    "CTEs break complex queries into modular, readable named temporary result sets that can be referenced multiple times.", "SQL", difficulty));
        } else if (clean.contains("react") || clean.contains("frontend") || clean.contains("javascript")) {
            questions.add(createQuestion("q1", "In React, what is the main purpose of the useEffect hook?",
                    Arrays.asList("To directly modify DOM elements synchronously", "To handle side effects like data fetching and subscriptions", "To compile JSX into plain HTML", "To replace Redux store state"), 1,
                    "useEffect runs side effects after component rendering, accommodating API calls, event listeners, and timers.", "React", difficulty));
            questions.add(createQuestion("q2", "What happens when you mutate a React state variable directly without setter function?",
                    Arrays.asList("React re-renders immediately with updated state", "React will not trigger a re-render because state reference unchanged", "A JavaScript SyntaxError is thrown", "The component drops state permanently"), 1,
                    "React relies on state reference changes to trigger reconciliation and re-rendering.", "React", difficulty));
            questions.add(createQuestion("q3", "Which method optimizes functional components by preventing unnecessary re-renders?",
                    Arrays.asList("React.memo()", "React.useRef()", "React.cloneElement()", "React.createRef()"), 0,
                    "React.memo is a higher-order component that skips rendering if component props have not changed.", "React", difficulty));
            questions.add(createQuestion("q4", "What is the key feature of the Virtual DOM in React?",
                    Arrays.asList("Directly replaces browser window DOM API", "In-memory light representation of real DOM to batch and diff updates efficiently", "A database for storing local storage items", "A WebGL engine for 3D rendering"), 1,
                    "React computes diffs in the Virtual DOM and performs minimal real DOM batch updates.", "React", difficulty));
            questions.add(createQuestion("q5", "What does the Dependency Array in useEffect control?",
                    Arrays.asList("The CSS style overrides", "When the effect callback re-executes based on value changes", "The HTML template parameters", "Component route permissions"), 1,
                    "If dependencies change between renders, React re-executes the effect callback.", "React", difficulty));
        } else if (clean.contains("java") || clean.contains("spring") || clean.contains("backend")) {
            questions.add(createQuestion("q1", "What does the @Autowired annotation do in Spring Boot?",
                    Arrays.asList("Enables HTTP cross-origin requests", "Injects bean dependencies automatically via Spring IoC container", "Compiles Java bytecode into native machine code", "Creates a SQL database table schema"), 1,
                    "@Autowired enables Spring's dependency injection mechanism to wire beans automatically into your components.", "Java Spring Boot", difficulty));
            questions.add(createQuestion("q2", "What is the difference between @RestController and @Controller in Spring MVC?",
                    Arrays.asList("@Controller returns JSON by default while @RestController returns HTML views", "@RestController combines @Controller and @ResponseBody, returning serialized JSON/XML data", "They are exact synonyms with no behavioral differences", "@RestController cannot handle HTTP GET requests"), 1,
                    "@RestController automatically serializes domain object return values directly into HTTP response bodies as JSON.", "Java Spring Boot", difficulty));
            questions.add(createQuestion("q3", "Which annotation marks a method to execute within a database transaction boundary?",
                    Arrays.asList("@Transactional", "@Entity", "@Repository", "@Configuration"), 0,
                    "@Transactional manages database transaction start, commit, and rollback logic automatically.", "Java Spring Boot", difficulty));
            questions.add(createQuestion("q4", "What is the primary role of Spring Security's SecurityFilterChain?",
                    Arrays.asList("Generates database indexes", "Configures servlet filters to authenticate and authorize HTTP requests", "Formats JSON API output", "Monitors JVM memory consumption"), 1,
                    "SecurityFilterChain specifies authentication rules, endpoint security policies, and CORS/CSRF handling.", "Java Spring Boot", difficulty));
            questions.add(createQuestion("q5", "In JPA/Hibernate, what does FetchType.LAZY accomplish?",
                    Arrays.asList("Loads related entities immediately on parent query", "Defers loading of child entities until explicitly accessed to save memory", "Prevents database writes permanently", "Disables database transactions"), 1,
                    "LAZY fetching avoids unnecessary database joins until the entity property is read.", "Java Spring Boot", difficulty));
        } else {
            questions.add(createQuestion("q1", "What is the key principle of Modular System Architecture?",
                    Arrays.asList("Combining all code into one single file", "Decoupling components into independent, reusable modules with clear contracts", "Eliminating database persistence", "Avoiding version control systems"), 1,
                    "Modular architecture promotes maintainability, testability, and isolated component scaling.", domain, difficulty));
            questions.add(createQuestion("q2", "Which metric best evaluates system reliability and uptime?",
                    Arrays.asList("SLO / SLA Availability Percentage (e.g. 99.99%)", "Line count per module", "CSS bundle size", "Database table count"), 0,
                    "Service Level Objectives (SLOs) measure uptime and acceptable error budgets.", domain, difficulty));
            questions.add(createQuestion("q3", "What is the primary benefit of Automated CI/CD Pipelines?",
                    Arrays.asList("Increases manual QA effort", "Delivers rapid, reliable code integration, testing, and automated deployment", "Eliminates unit testing requirements", "Replaces cloud hosting infrastructure"), 1,
                    "Continuous Integration and Continuous Deployment automate testing and releases, shortening feedback loops.", domain, difficulty));
            questions.add(createQuestion("q4", "What is the purpose of API Rate Limiting?",
                    Arrays.asList("Increases network latency for all users", "Protects backend infrastructure from denial-of-service and resource exhaustion", "Deletes database records automatically", "Encodes API payloads in binary"), 1,
                    "Rate limiting caps excessive requests to preserve system health and security.", domain, difficulty));
            questions.add(createQuestion("q5", "Which practice ensures zero downtime during production software releases?",
                    Arrays.asList("Shutting down servers during peak hours", "Blue-Green or Canary Deployments", "Hardcoding database credentials", "Disabling automated logging"), 1,
                    "Blue-Green and Canary strategies route traffic gradually to new releases without interrupting service.", domain, difficulty));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("domain", domain);
        result.put("difficulty", difficulty);
        result.put("questions", questions.subList(0, Math.min(count, questions.size())));
        return result;
    }

    private Map<String, Object> createQuestion(String id, String text, List<String> options, int correctIdx, String explanation, String skill, String difficulty) {
        Map<String, Object> q = new HashMap<>();
        q.put("id", id);
        q.put("questionText", text);
        q.put("options", options);
        q.put("correctOptionIndex", correctIdx);
        q.put("explanation", explanation);
        q.put("targetSkill", skill);
        q.put("difficulty", difficulty);
        return q;
    }
}
