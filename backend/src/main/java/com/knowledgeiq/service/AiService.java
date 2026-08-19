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
import com.knowledgeiq.util.UrlValidatorUtil;

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
    private TrainingCourseRepository courseRepository;

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
            "You are an expert curriculum architect and technical mentor for KnowledgeIQ.\n" +
            "For the professional role/domain named \"%s\", generate:\n" +
            "1. Exactly 5 core technical skills that are essential to master, with expected proficiency levels (1-5).\n" +
            "2. Exactly 3 to 5 high-quality course or tutorial recommendations that teach these skills.\n\n" +
            "CRITICAL INSTRUCTIONS FOR COURSE URLS:\n" +
            "- Provide a real, publicly accessible learning resource URL when possible.\n" +
            "- Prefer official documentation and courses from reputable providers (e.g. Spring, Microsoft, AWS, Google, Oracle, MDN, Python.org, React.dev, PostgreSQL.org, Docker, Kubernetes, freeCodeCamp, Coursera, Udemy).\n" +
            "- Do NOT invent or fabricate fake URLs. If a reliable, official URL cannot be provided, set \"url\": null.\n\n" +
            "Return the output as a valid JSON object matching this schema:\n" +
            "{\n" +
            "  \"skills\": [\n" +
            "    {\"name\": \"Skill Name\", \"expectedLevel\": 4}\n" +
            "  ],\n" +
            "  \"courses\": [\n" +
            "    {\n" +
            "      \"title\": \"Course Title\",\n" +
            "      \"provider\": \"Provider Name (e.g. Spring, AWS, React, MDN, Coursera)\",\n" +
            "      \"description\": \"Action-oriented summary of what this course covers...\",\n" +
            "      \"url\": \"https://... or null\",\n" +
            "      \"skill\": \"Target Skill Name\",\n" +
            "      \"level\": 4,\n" +
            "      \"durationHours\": 6\n" +
            "    }\n" +
            "  ]\n" +
            "}\n" +
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
        List<Map<String, Object>> rawCourses = (List<Map<String, Object>>) rawData.get("courses");
        if (rawCourses == null) {
            rawCourses = (List<Map<String, Object>>) rawData.get("recommendations");
        }

        SkillCategory category = skillCategoryRepository.findAll().stream().findFirst().orElseGet(() -> {
            SkillCategory cat = new SkillCategory();
            cat.setName("Technical");
            cat.setDescription("AI-suggested Technical Skills");
            return skillCategoryRepository.save(cat);
        });

        Map<String, Skill> skillMapByName = new HashMap<>();
        List<Map<String, Object>> syncedSkills = new ArrayList<>();
        if (rawSkills != null) {
            for (Map<String, Object> rawSkillMap : rawSkills) {
                String skillName = (String) rawSkillMap.get("name");
                if (skillName == null || skillName.isBlank()) continue;
                Integer expectedLevel = (Integer) rawSkillMap.get("expectedLevel");
                if (expectedLevel == null) expectedLevel = 4;

                final String sName = skillName;
                Skill skill = skillRepository.findAllByName(sName).stream().findFirst()
                        .orElseGet(() -> {
                            Skill s = new Skill();
                            s.setName(sName);
                            s.setCategory(category);
                            s.setDescription("AI Suggested Skill for domain");
                            return skillRepository.save(s);
                        });
                skillMapByName.put(sName.toLowerCase(), skill);
                
                Map<String, Object> skillInfo = new HashMap<>();
                skillInfo.put("skillId", skill.getId().toString());
                skillInfo.put("name", skill.getName());
                skillInfo.put("expectedLevel", expectedLevel);
                syncedSkills.add(skillInfo);
            }
        }

        List<Map<String, Object>> syncedCourses = new ArrayList<>();
        if (rawCourses != null) {
            for (Map<String, Object> rawCourseMap : rawCourses) {
                String title = (String) rawCourseMap.get("title");
                if (title == null || title.isBlank()) continue;
                String provider = (String) rawCourseMap.get("provider");
                String description = (String) rawCourseMap.get("description");
                String rawUrl = (String) rawCourseMap.get("url");
                String sanitizedUrl = UrlValidatorUtil.sanitizeUrl(rawUrl);

                String targetSkillName = (String) rawCourseMap.get("skill");
                if (targetSkillName == null) targetSkillName = (String) rawCourseMap.get("targetSkill");
                
                Skill targetSkill = null;
                if (targetSkillName != null && !targetSkillName.isBlank()) {
                    targetSkill = skillMapByName.get(targetSkillName.toLowerCase());
                    if (targetSkill == null) {
                        final String finalSkillName = targetSkillName;
                        targetSkill = skillRepository.findAllByName(finalSkillName).stream().findFirst()
                                .orElseGet(() -> {
                                    Skill s = new Skill();
                                    s.setName(finalSkillName);
                                    s.setCategory(category);
                                    s.setDescription("AI Suggested Skill");
                                    return skillRepository.save(s);
                                });
                        skillMapByName.put(targetSkillName.toLowerCase(), targetSkill);
                    }
                }

                Object lvlObj = rawCourseMap.get("level");
                if (lvlObj == null) lvlObj = rawCourseMap.get("targetLevel");
                int targetLevel = 4;
                if (lvlObj instanceof Integer) targetLevel = (Integer) lvlObj;
                else if (lvlObj instanceof String) {
                    try { targetLevel = Integer.parseInt((String) lvlObj); } catch (Exception ignored) {}
                }

                Object durObj = rawCourseMap.get("durationHours");
                int durationHours = 6;
                if (durObj instanceof Integer) durationHours = (Integer) durObj;
                else if (durObj instanceof String) {
                    try { durationHours = Integer.parseInt((String) durObj); } catch (Exception ignored) {}
                }

                final Skill fSkill = targetSkill;
                final String fTitle = title;
                final String fDesc = description;
                final String fProvider = provider != null ? provider : "KnowledgeIQ Learning";
                final String fUrl = sanitizedUrl;
                final int fLevel = targetLevel;
                final int fDur = durationHours;

                TrainingCourse course = courseRepository.findAll().stream()
                        .filter(c -> c.getTitle().equalsIgnoreCase(fTitle))
                        .findFirst()
                        .orElse(null);

                if (course == null && fSkill != null) {
                    List<TrainingCourse> existingForSkill = courseRepository.findByTargetSkillId(fSkill.getId());
                    if (!existingForSkill.isEmpty()) {
                        course = existingForSkill.get(0);
                    }
                }

                if (course == null) {
                    course = new TrainingCourse();
                    course.setTitle(fTitle);
                    course.setDescription(fDesc != null ? fDesc : "Master " + (fSkill != null ? fSkill.getName() : fTitle) + " with practical exercises.");
                    course.setProvider(fProvider);
                    course.setCourseUrl(fUrl);
                    course.setTargetSkill(fSkill);
                    course.setTargetLevel(fLevel);
                    course.setDurationHours(fDur);
                    course = courseRepository.save(course);
                } else {
                    // Update URL if existing was null/empty and new one is valid
                    boolean updated = false;
                    if ((course.getCourseUrl() == null || course.getCourseUrl().isBlank()) && fUrl != null) {
                        course.setCourseUrl(fUrl);
                        updated = true;
                    }
                    if (course.getProvider() == null && fProvider != null) {
                        course.setProvider(fProvider);
                        updated = true;
                    }
                    if (updated) {
                        course = courseRepository.save(course);
                    }
                }

                Map<String, Object> courseInfo = new HashMap<>();
                courseInfo.put("id", course.getId().toString());
                courseInfo.put("title", course.getTitle());
                courseInfo.put("provider", course.getProvider());
                courseInfo.put("description", course.getDescription());
                courseInfo.put("url", course.getCourseUrl());
                courseInfo.put("courseUrl", course.getCourseUrl());
                courseInfo.put("skill", targetSkill != null ? targetSkill.getName() : null);
                courseInfo.put("level", course.getTargetLevel());
                courseInfo.put("durationHours", course.getDurationHours());
                syncedCourses.add(courseInfo);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("skills", syncedSkills);
        result.put("courses", syncedCourses);
        return result;
    }

    private Map<String, Object> getLocalFallbackSuggestions(String domain) {
        String cleanDomain = domain.toLowerCase().trim();
        List<Map<String, Object>> skills = new ArrayList<>();
        List<Map<String, Object>> courses = new ArrayList<>();

        if (cleanDomain.contains("devops") || cleanDomain.contains("infrastructure") || cleanDomain.contains("site reliability") || cleanDomain.contains("cloud")) {
            skills = Arrays.asList(
                createSkillMap("Docker", 5), createSkillMap("Kubernetes", 5), createSkillMap("Cloud / AWS", 5),
                createSkillMap("Linux", 4), createSkillMap("CI/CD", 4)
            );
            courses = Arrays.asList(
                createCourseMap("Docker Containerization & Compose", "Docker", "https://docs.docker.com/get-started/", "Docker", 5, 6, "Learn container fundamentals, multi-stage builds, and Compose orchestration."),
                createCourseMap("Kubernetes Production Cluster Orchestration", "Kubernetes", "https://kubernetes.io/docs/tutorials/", "Kubernetes", 5, 8, "Deploy, scale, and manage microservices on production Kubernetes."),
                createCourseMap("AWS Cloud Practitioner & Architecture", "Amazon Web Services", "https://aws.amazon.com/getting-started/", "Cloud / AWS", 5, 10, "Design scalable, resilient cloud architectures using core AWS services.")
            );
        } else if (cleanDomain.contains("frontend") || cleanDomain.contains("react") || cleanDomain.contains("ui") || cleanDomain.contains("web")) {
            skills = Arrays.asList(
                createSkillMap("React", 5), createSkillMap("UI/UX Design", 4), createSkillMap("SQL", 3),
                createSkillMap("Cloud / AWS", 3), createSkillMap("Communication & Stakeholder Management", 4)
            );
            courses = Arrays.asList(
                createCourseMap("Modern React Architecture & Component Design", "React / Meta", "https://react.dev/learn", "React", 5, 6, "Learn modern React 18/19 hooks, component trees, state management, and modern component patterns."),
                createCourseMap("Figma Design Systems & Interactive Prototyping", "Figma", "https://help.figma.com/hc/en-us/categories/360002051613-Get-started", "UI/UX Design", 4, 6, "Build scalable UI component libraries, variants, and high-fidelity prototypes."),
                createCourseMap("Executive Communication & Stakeholder Alignment", "Coursera", "https://www.coursera.org/learn/executive-presence", "Communication & Stakeholder Management", 4, 4, "Structured communication frameworks for technical leadership and cross-functional collaboration.")
            );
        } else if (cleanDomain.contains("design") || cleanDomain.contains("ux") || cleanDomain.contains("product designer")) {
            skills = Arrays.asList(
                createSkillMap("Figma", 5), createSkillMap("UI/UX Design", 5), createSkillMap("Wireframing", 4),
                createSkillMap("User Research", 4), createSkillMap("Interaction Design", 4)
            );
            courses = Arrays.asList(
                createCourseMap("Figma Design Systems & Interactive Prototyping", "Figma", "https://help.figma.com/hc/en-us/categories/360002051613-Get-started", "Figma", 5, 6, "Build scalable UI component libraries, variants, and high-fidelity prototypes."),
                createCourseMap("Interaction Design & Usability Testing", "Interaction Design Foundation", "https://www.interaction-design.org/literature", "UI/UX Design", 5, 8, "Master user research methodologies and usability evaluation heuristics.")
            );
        } else if (cleanDomain.contains("python") || cleanDomain.contains("data") || cleanDomain.contains("analytics") || cleanDomain.contains("ml")) {
            skills = Arrays.asList(
                createSkillMap("Python", 5), createSkillMap("SQL", 4), createSkillMap("Data Analytics", 4),
                createSkillMap("Cloud / AWS", 4), createSkillMap("Communication & Stakeholder Management", 4)
            );
            courses = Arrays.asList(
                createCourseMap("Python for Data Analysis & Engineering", "Python Software Foundation", "https://docs.python.org/3/tutorial/", "Python", 5, 8, "Data manipulation, Pandas dataframes, and automated analytical pipelines."),
                createCourseMap("Advanced SQL Query Optimization & Modeling", "PostgreSQL", "https://www.postgresql.org/docs/current/tutorial.html", "SQL", 4, 5, "Write performant SQL queries, understand execution plans, and design relational schemas."),
                createCourseMap("AWS Cloud Practitioner & Architecture", "Amazon Web Services", "https://aws.amazon.com/getting-started/", "Cloud / AWS", 4, 10, "Design scalable, resilient cloud architectures using core AWS services.")
            );
        } else if (cleanDomain.contains("java") || cleanDomain.contains("backend") || cleanDomain.contains("spring")) {
            skills = Arrays.asList(
                createSkillMap("Java Spring Boot", 5), createSkillMap("SQL", 4), createSkillMap("Cloud / AWS", 4),
                createSkillMap("Security", 4), createSkillMap("Communication & Stakeholder Management", 4)
            );
            courses = Arrays.asList(
                createCourseMap("Spring Boot & Microservices Development", "Spring / VMware", "https://spring.io/guides/gs/spring-boot", "Java Spring Boot", 5, 8, "Build production-grade REST APIs, dependency injection, and cloud-native microservices."),
                createCourseMap("Advanced SQL Query Optimization & Relational Modeling", "PostgreSQL", "https://www.postgresql.org/docs/current/tutorial.html", "SQL", 4, 5, "Database schema design, indexing strategies, and transaction isolation."),
                createCourseMap("AWS Cloud Solutions Architect Foundations", "Amazon Web Services", "https://aws.amazon.com/getting-started/", "Cloud / AWS", 4, 10, "Architecting resilient backend services on Amazon Web Services infrastructure.")
            );
        } else if (cleanDomain.contains("marketing") || cleanDomain.contains("content") || cleanDomain.contains("seo")) {
            skills = Arrays.asList(
                createSkillMap("Content Strategy & Copywriting", 5), createSkillMap("SEO & Digital Advertising", 5),
                createSkillMap("Social Media Analytics & Growth", 4), createSkillMap("Campaign Management & ROI", 4),
                createSkillMap("Brand Strategy", 4)
            );
            courses = Arrays.asList(
                createCourseMap("Modern Content Marketing Strategy", "HubSpot Academy", "https://academy.hubspot.com/", "Content Strategy & Copywriting", 5, 6, "Develop impactful brand storytelling and strategic content workflows."),
                createCourseMap("SEO & Digital Growth Foundations", "Google Digital Garage", "https://learndigital.withgoogle.com/", "SEO & Digital Advertising", 5, 6, "Search engine optimization, keyword targeting, and analytics conversion tracking.")
            );
        } else {
            skills = Arrays.asList(
                createSkillMap("React", 4), createSkillMap("Java Spring Boot", 5), createSkillMap("SQL", 4),
                createSkillMap("Cloud / AWS", 4), createSkillMap("Communication & Stakeholder Management", 4)
            );
            courses = Arrays.asList(
                createCourseMap("Spring Boot & Microservices Development", "Spring / VMware", "https://spring.io/guides/gs/spring-boot", "Java Spring Boot", 5, 8, "Enterprise application development using Java Spring Boot."),
                createCourseMap("Modern React Architecture & Component Design", "React / Meta", "https://react.dev/learn", "React", 4, 6, "Learn modern React 18/19 hooks, component trees, and state management."),
                createCourseMap("Executive Communication & Stakeholder Alignment", "Coursera", "https://www.coursera.org/learn/executive-presence", "Communication & Stakeholder Management", 4, 4, "Technical leadership and executive communication strategies.")
            );
        }

        Map<String, Object> result = new HashMap<>();
        result.put("skills", skills);
        result.put("courses", courses);
        return result;
    }

    private Map<String, Object> createSkillMap(String name, int expectedLevel) {
        Map<String, Object> skill = new HashMap<>();
        skill.put("name", name);
        skill.put("expectedLevel", expectedLevel);
        return skill;
    }

    private Map<String, Object> createCourseMap(String title, String provider, String url, String skill, int level, int durationHours, String description) {
        Map<String, Object> course = new HashMap<>();
        course.put("title", title);
        course.put("provider", provider);
        course.put("url", url);
        course.put("skill", skill);
        course.put("level", level);
        course.put("durationHours", durationHours);
        course.put("description", description);
        return course;
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
        String clean = domain.toLowerCase().trim();
        List<Map<String, Object>> pool = new ArrayList<>();
        Random rng = new Random();

        if (clean.contains("data") || clean.contains("sql") || clean.contains("analytics") || clean.contains("python") || clean.contains("tableau")) {
            pool.add(createDynamicQuestion("What is the primary function of the SQL HAVING clause?",
                    Arrays.asList("Filter groups formed by GROUP BY clause", "Filter rows before grouping", "Sort result set in descending order", "Join two tables on primary key"),
                    "HAVING is used to filter aggregated group records, whereas WHERE filters individual rows prior to aggregation.", "SQL", difficulty, rng));
            pool.add(createDynamicQuestion("In pandas / Data Analytics, which method handles missing NaN values effectively?",
                    Arrays.asList("df.fillna() or df.dropna()", "df.clean_nulls()", "df.remove_nan()", "df.filter_empty()"),
                    "fillna() replaces missing NaN values with specified data or statistics, while dropna() removes rows containing NaN.", "Data Analytics", difficulty, rng));
            pool.add(createDynamicQuestion("What distinguishes INNER JOIN from LEFT JOIN in relational databases?",
                    Arrays.asList("LEFT JOIN returns all rows from left table and matching rows from right table", "INNER JOIN returns all rows from left table regardless of match", "They produce identical results in ANSI SQL", "INNER JOIN includes null values from both tables"),
                    "LEFT JOIN retains all rows from the left table regardless of whether a matching record exists in the right table.", "SQL", difficulty, rng));
            pool.add(createDynamicQuestion("Which chart type is best suited to display data distribution, outliers, and quartiles?",
                    Arrays.asList("Box Plot (Box-and-Whisker)", "Pie Chart", "Line Graph", "Donut Chart"),
                    "Box plots visually depict five-number statistical summaries: minimum, lower quartile, median, upper quartile, and maximum.", "Data Analytics", difficulty, rng));
            pool.add(createDynamicQuestion("What is the key advantage of using Common Table Expressions (CTEs) with WITH clause in SQL?",
                    Arrays.asList("Improves query readability and enables recursive querying", "Increases query execution speed by 10x", "Permanently indexes the target table", "Bypasses database security permissions"),
                    "CTEs break complex queries into modular, readable named temporary result sets that can be referenced multiple times.", "SQL", difficulty, rng));
            pool.add(createDynamicQuestion("In Python data analysis, which library is specifically optimized for vectorized multidimensional array operations?",
                    Arrays.asList("NumPy", "Flask", "Requests", "BeautifulSoup"),
                    "NumPy provides C-optimized ndarray data structures and vectorized broadcasting routines.", "Python", difficulty, rng));
            pool.add(createDynamicQuestion("What is the difference between RANK() and DENSE_RANK() in SQL window functions?",
                    Arrays.asList("DENSE_RANK() does not skip rank numbers for duplicate values, while RANK() leaves gaps", "RANK() only works on unique strings", "DENSE_RANK() always calculates running totals", "They are identical synonyms in PostgreSQL"),
                    "RANK() assigns 1, 2, 2, 4 whereas DENSE_RANK() assigns 1, 2, 2, 3 without skipping sequence numbers.", "SQL", difficulty, rng));
            pool.add(createDynamicQuestion("In statistical analysis, what does a p-value less than 0.05 typically signify?",
                    Arrays.asList("Statistically significant evidence to reject the null hypothesis", "The sample size is too small", "The test was calculated incorrectly", "The dataset contains 95% missing values"),
                    "A p-value < 0.05 indicates the observed effect is unlikely to have occurred solely by random chance.", "Data Analytics", difficulty, rng));
            pool.add(createDynamicQuestion("What is the main purpose of Database Normalization (3NF)?",
                    Arrays.asList("Reduce data redundancy and prevent insertion/deletion anomalies", "Increase table size artificially", "Disable primary key constraints", "Format dates into ISO 8601 strings"),
                    "Third Normal Form (3NF) minimizes duplicate data and ensures non-key attributes depend solely on the primary key.", "Database Architecture", difficulty, rng));
            pool.add(createDynamicQuestion("Which Python method combines multiple DataFrames along a specified axis without SQL-like keys?",
                    Arrays.asList("pd.concat()", "pd.merge()", "pd.join()", "pd.combine_all()"),
                    "pd.concat() concatenates pandas objects along a particular axis (rows or columns) sequentially.", "Data Analytics", difficulty, rng));
        } else if (clean.contains("react") || clean.contains("frontend") || clean.contains("javascript") || clean.contains("ui") || clean.contains("css")) {
            pool.add(createDynamicQuestion("In React, what is the main purpose of the useEffect hook?",
                    Arrays.asList("To handle side effects like data fetching, subscriptions, and DOM updates", "To directly modify DOM elements synchronously", "To compile JSX into plain HTML", "To replace Redux store state"),
                    "useEffect runs side effects after component rendering, accommodating API calls, event listeners, and timers.", "React", difficulty, rng));
            pool.add(createDynamicQuestion("What happens when you mutate a React state variable directly without setter function?",
                    Arrays.asList("React will not trigger a re-render because object reference unchanged", "React re-renders immediately with updated state", "A JavaScript SyntaxError is thrown", "The component drops state permanently"),
                    "React relies on immutable state reference changes to trigger reconciliation and re-rendering.", "React", difficulty, rng));
            pool.add(createDynamicQuestion("Which technique prevents unnecessary re-rendering of child components when parent props remain equal?",
                    Arrays.asList("React.memo() and useMemo() / useCallback()", "document.getElementById()", "componentWillMount()", "useLayoutEffect() with inline arrow functions"),
                    "React.memo memoizes the rendered output of the wrapped component and skips renders if props are unchanged.", "React", difficulty, rng));
            pool.add(createDynamicQuestion("What is the key advantage of React's Virtual DOM reconciliation algorithm?",
                    Arrays.asList("Batches and calculates minimum necessary real DOM changes efficiently", "Replaces the browser window object", "Directly connects to PostgreSQL databases", "Runs client code in web workers automatically"),
                    "Virtual DOM diffing determines minimal DOM mutations, avoiding costly full page repaints.", "React", difficulty, rng));
            pool.add(createDynamicQuestion("What does the Dependency Array in useEffect control?",
                    Arrays.asList("When the effect callback re-executes based on value changes", "The CSS styling rules applied", "The HTML template parameters", "Component route permissions"),
                    "If dependencies change between renders, React cleans up and re-executes the effect callback.", "React", difficulty, rng));
            pool.add(createDynamicQuestion("In modern JavaScript (ES6+), what is the difference between let/const and var?",
                    Arrays.asList("let and const have block scope, whereas var is function scoped and hoisted", "var is immutable while const is mutable", "let cannot be reassigned", "const can be redeclared anywhere"),
                    "let and const prevent accidental global leakage by enforcing strict block-level lexical scoping.", "JavaScript", difficulty, rng));
            pool.add(createDynamicQuestion("What is the primary purpose of the useCallback hook in React?",
                    Arrays.asList("Memoize callback function instances across renders to preserve reference equality", "Execute asynchronous HTTP requests on every keystroke", "Manage CSS class transitions", "Replace useState for primitives"),
                    "useCallback returns a memoized version of the callback that only changes if dependencies update.", "React", difficulty, rng));
            pool.add(createDynamicQuestion("In CSS Flexbox, which property aligns flex items along the cross axis?",
                    Arrays.asList("align-items", "justify-content", "flex-direction", "flex-wrap"),
                    "align-items defines default alignment along the cross axis, while justify-content aligns along the main axis.", "CSS", difficulty, rng));
            pool.add(createDynamicQuestion("What is the purpose of React Portal (ReactDOM.createPortal)?",
                    Arrays.asList("Render children into a DOM node outside the parent component's DOM hierarchy (e.g. Modals)", "Establish WebSocket connections to backend servers", "Preload image assets in parallel", "Compress JavaScript bundles for production"),
                    "Portals allow modals, tooltips, and floating drawers to break out of overflow/z-index clipping containers.", "React", difficulty, rng));
            pool.add(createDynamicQuestion("In JavaScript, what does Promise.all() do when one of the promises rejects?",
                    Arrays.asList("Immediately rejects the entire returned promise with that rejection reason", "Ignores the failed promise and returns only resolved values", "Retries the failed request 3 times", "Pauses execution indefinitely"),
                    "Promise.all has fail-fast behavior: if any promise rejects, the entire master promise rejects immediately.", "JavaScript", difficulty, rng));
        } else if (clean.contains("java") || clean.contains("spring") || clean.contains("backend") || clean.contains("api") || clean.contains("microservice")) {
            pool.add(createDynamicQuestion("What does the @Autowired annotation do in Spring Boot?",
                    Arrays.asList("Injects bean dependencies automatically via Spring IoC container", "Enables HTTP cross-origin requests", "Compiles Java bytecode into native machine code", "Creates a SQL database table schema"),
                    "@Autowired enables Spring's dependency injection mechanism to wire beans automatically into your components.", "Java Spring Boot", difficulty, rng));
            pool.add(createDynamicQuestion("What is the difference between @RestController and @Controller in Spring MVC?",
                    Arrays.asList("@RestController combines @Controller and @ResponseBody, returning serialized JSON/XML data", "@Controller returns JSON by default while @RestController returns HTML views", "They are exact synonyms with no behavioral differences", "@RestController cannot handle HTTP GET requests"),
                    "@RestController automatically serializes domain object return values directly into HTTP response bodies as JSON.", "Java Spring Boot", difficulty, rng));
            pool.add(createDynamicQuestion("Which annotation marks a method to execute within a database transaction boundary?",
                    Arrays.asList("@Transactional", "@Entity", "@Repository", "@Configuration"),
                    "@Transactional manages database transaction start, commit, and rollback logic automatically.", "Java Spring Boot", difficulty, rng));
            pool.add(createDynamicQuestion("What is the primary role of Spring Security's SecurityFilterChain?",
                    Arrays.asList("Configures servlet filters to authenticate and authorize HTTP requests", "Generates database indexes", "Formats JSON API output", "Monitors JVM memory consumption"),
                    "SecurityFilterChain specifies authentication rules, endpoint security policies, and CORS/CSRF handling.", "Java Spring Boot", difficulty, rng));
            pool.add(createDynamicQuestion("In JPA/Hibernate, what does FetchType.LAZY accomplish?",
                    Arrays.asList("Defers loading of child entities until explicitly accessed to save memory and queries", "Loads related entities immediately on parent query", "Prevents database writes permanently", "Disables database transactions"),
                    "LAZY fetching avoids unnecessary database joins until the entity property is read.", "Java Spring Boot", difficulty, rng));
            pool.add(createDynamicQuestion("What is the purpose of Spring Boot's @ExceptionHandler annotation?",
                    Arrays.asList("Intercept and handle specific exceptions across controllers with custom error response DTOs", "Throw RuntimeExceptions automatically", "Log CPU usage statistics", "Encrypt sensitive properties"),
                    "@ExceptionHandler defines centralized methods for handling runtime exceptions and returning standardized HTTP error codes.", "Java Spring Boot", difficulty, rng));
            pool.add(createDynamicQuestion("In Java Concurrency, what is the key feature of ConcurrentHashMap over Collections.synchronizedMap()?",
                    Arrays.asList("Lock striping / bucket-level locking allowing concurrent reads and writes without locking the whole map", "Disallows all null keys and values", "Stores data in disk storage", "Restricts access to a single thread"),
                    "ConcurrentHashMap achieves high concurrency by segmenting buckets so threads rarely contend for the same lock.", "Java", difficulty, rng));
            pool.add(createDynamicQuestion("What is the difference between Spring Bean scopes 'singleton' and 'prototype'?",
                    Arrays.asList("Singleton creates a single shared instance per container; prototype creates a new instance on every injection", "Prototype is only used for unit testing", "Singleton creates one instance per HTTP request", "They share identical lifecycle rules"),
                    "Singleton is the default scope with one instance per Spring context, whereas prototype creates a new bean every time.", "Java Spring Boot", difficulty, rng));
            pool.add(createDynamicQuestion("In Spring Data JPA, what does the @Modifying annotation signify?",
                    Arrays.asList("Indicates that a custom @Query method executes an INSERT, UPDATE, or DELETE query", "Creates a temporary clone of the entity", "Marks an entity as read-only", "Enables cache eviction"),
                    "@Modifying informs Spring Data that the query modifies table data and should not be treated as a SELECT query.", "Java Spring Boot", difficulty, rng));
            pool.add(createDynamicQuestion("In JVM performance tuning, which generation stores newly created objects before promotion?",
                    Arrays.asList("Eden Space in the Young Generation", "Old / Tenured Generation", "Metaspace", "Native Memory Heap"),
                    "New objects are allocated in Eden Space; survivors of minor GC cycles move to Survivor spaces and then Tenured generation.", "Java", difficulty, rng));
        } else if (clean.contains("cloud") || clean.contains("devops") || clean.contains("docker") || clean.contains("kubernetes") || clean.contains("aws")) {
            pool.add(createDynamicQuestion("What is the primary advantage of Multi-Stage Builds in Dockerfiles?",
                    Arrays.asList("Minimizes final image size by discarding build tools and intermediate artifacts", "Compiles code 10x faster", "Bypasses container security scanning", "Allows running multiple OS kernels simultaneously"),
                    "Multi-stage builds copy only compiled artifacts to a lean runtime base image, keeping production images compact and secure.", "Cloud & DevOps", difficulty, rng));
            pool.add(createDynamicQuestion("In Kubernetes, what is the role of an Ingress Controller?",
                    Arrays.asList("Routes external HTTP/HTTPS traffic to internal cluster Services based on host/path rules", "Allocates CPU memory to worker nodes", "Backs up etcd storage to AWS S3", "Compiles container binaries"),
                    "Ingress manages external access to cluster services, providing reverse proxy routing, SSL termination, and name-based virtual hosting.", "Cloud & DevOps", difficulty, rng));
            pool.add(createDynamicQuestion("What is the core concept behind Infrastructure as Code (IaC) with tools like Terraform?",
                    Arrays.asList("Declaratively provisioning and version-controlling cloud infrastructure resources", "Writing application frontend templates", "Replacing database backups", "Auto-generating CSS classes"),
                    "IaC defines cloud infrastructure in human-readable code files that can be versioned, reviewed, and automated.", "Cloud & DevOps", difficulty, rng));
            pool.add(createDynamicQuestion("What does the Principle of Least Privilege dictate in Cloud IAM security?",
                    Arrays.asList("Granting users and service accounts only the absolute minimum permissions needed to perform tasks", "Giving all team members root administrator access", "Allowing public read access to all S3 buckets", "Disabling password expiration policies"),
                    "Least Privilege prevents blast radius escalation by strictly restricting permissions to required actions.", "Cloud & DevOps", difficulty, rng));
            pool.add(createDynamicQuestion("In CI/CD, what is the difference between Continuous Delivery and Continuous Deployment?",
                    Arrays.asList("Continuous Delivery requires manual approval before production deployment; Continuous Deployment deploys automatically", "Continuous Delivery does not run unit tests", "Continuous Deployment only applies to mobile apps", "They are identical processes"),
                    "Continuous Deployment automates the complete pipeline through to production without human gatekeeper intervention.", "Cloud & DevOps", difficulty, rng));
            pool.add(createDynamicQuestion("Which metric is critical for monitoring microservice health in Prometheus?",
                    Arrays.asList("Request Rate, Error Rate, and Duration / Latency (RED Method)", "Line count per Dockerfile", "Local disk temperature", "Font bundle compression ratio"),
                    "The RED method focuses on Rate, Errors, and Duration to evaluate microservice performance and user experience.", "Cloud & DevOps", difficulty, rng));
        } else if (clean.contains("marketing") || clean.contains("sales") || clean.contains("growth") || clean.contains("seo")) {
            pool.add(createDynamicQuestion("What is Customer Acquisition Cost (CAC) and how is it calculated?",
                    Arrays.asList("Total sales & marketing spend divided by number of new customers acquired", "Total revenue divided by employee count", "Monthly recurring revenue multiplied by churn rate", "Total website visitors minus bounce rate"),
                    "CAC measures total expenses invested in acquiring a new customer over a specific campaign period.", "Marketing Strategy", difficulty, rng));
            pool.add(createDynamicQuestion("In Search Engine Optimization (SEO), what is the purpose of a Canonical Tag (rel='canonical')?",
                    Arrays.asList("Specifies the preferred master URL to search engines to prevent duplicate content penalties", "Increases keyword density artificially", "Compresses page images", "Blocks search engines from crawling the site"),
                    "Canonical tags inform search engines which URL represents the original source when multiple URLs have duplicate content.", "SEO & Digital Strategy", difficulty, rng));
            pool.add(createDynamicQuestion("What does the LTV:CAC ratio measure in business growth strategy?",
                    Arrays.asList("The long-term value of a customer relative to the cost of acquiring them (benchmark >= 3:1)", "The ratio of marketing staff to sales staff", "The bounce rate of mobile visitors", "The speed of page rendering"),
                    "An LTV:CAC ratio of 3x or higher indicates sustainable and profitable customer acquisition economics.", "Marketing Strategy", difficulty, rng));
            pool.add(createDynamicQuestion("In Conversion Rate Optimization (CRO), what is the purpose of A/B Split Testing?",
                    Arrays.asList("Comparing two variants (A vs B) with randomized traffic to measure statistically significant conversion differences", "Replacing all website copy simultaneously", "Sending marketing emails to unsubscribed users", "Increasing ad budget automatically"),
                    "A/B testing validates whether design or copy changes causally improve target user conversion metrics.", "Marketing Strategy", difficulty, rng));
        } else if (clean.contains("hr") || clean.contains("talent") || clean.contains("recruit") || clean.contains("people")) {
            pool.add(createDynamicQuestion("What is the primary purpose of Structured Competency-Based Interviews?",
                    Arrays.asList("Assessing candidates against standardized rubric criteria to eliminate bias and predict job performance", "Asking unstructured trivia questions", "Testing general memory recall", "Shortening interviews to under 5 minutes"),
                    "Structured interviews evaluate specific demonstrated competencies using identical scoring rubrics for all candidates.", "HR Operations", difficulty, rng));
            pool.add(createDynamicQuestion("In organizational talent management, what does the 9-Box Grid evaluate?",
                    Arrays.asList("Employee Performance versus Future Leadership Potential", "Attendance records versus salary bands", "Department budget versus headcount", "Software licenses versus hardware inventory"),
                    "The 9-Box grid plots current performance against growth potential to guide succession planning and development.", "Talent Management", difficulty, rng));
            pool.add(createDynamicQuestion("What is the key differentiator between OKRs (Objectives and Key Results) and traditional KPIs?",
                    Arrays.asList("OKRs focus on ambitious, qualitative growth targets with measurable milestones; KPIs measure ongoing operational health", "KPIs are only used for marketing teams", "OKRs replace financial accounting standards", "KPIs cannot be tracked with numbers"),
                    "OKRs drive strategic transformation and alignment, while KPIs monitor ongoing business-as-usual operational metrics.", "HR Strategy", difficulty, rng));
            pool.add(createDynamicQuestion("What is the strategic objective of 360-Degree Peer Feedback in performance appraisals?",
                    Arrays.asList("Gathering multidimensional perspectives from peers, reports, and managers to eliminate single-evaluator bias", "Comparing employee salaries publicly", "Assigning daily task tickets", "Automating payroll deductions"),
                    "360-degree feedback provides holistic behavioral insights from cross-functional colleagues.", "Talent Management", difficulty, rng));
        } else {
            pool.add(createDynamicQuestion("What is the key principle of Modular Software Architecture?",
                    Arrays.asList("Decoupling components into independent, reusable modules with clear contracts", "Combining all code into one single file", "Eliminating database persistence", "Avoiding version control systems"),
                    "Modular architecture promotes maintainability, testability, and isolated component scaling.", domain, difficulty, rng));
            pool.add(createDynamicQuestion("Which metric best evaluates system reliability and service availability?",
                    Arrays.asList("SLO / SLA Availability Percentage (e.g. 99.99%)", "Line count per module", "CSS bundle size", "Database table count"),
                    "Service Level Objectives (SLOs) measure uptime and acceptable error budgets.", domain, difficulty, rng));
            pool.add(createDynamicQuestion("What is the primary benefit of Automated CI/CD Pipelines?",
                    Arrays.asList("Delivers rapid, reliable code integration, testing, and automated deployment", "Increases manual QA effort", "Eliminates unit testing requirements", "Replaces cloud hosting infrastructure"),
                    "Continuous Integration and Continuous Deployment automate testing and releases, shortening feedback loops.", domain, difficulty, rng));
            pool.add(createDynamicQuestion("What is the purpose of API Rate Limiting in distributed systems?",
                    Arrays.asList("Protects backend infrastructure from denial-of-service and resource exhaustion", "Increases network latency for all users", "Deletes database records automatically", "Encodes API payloads in binary"),
                    "Rate limiting caps excessive requests to preserve system health and security.", domain, difficulty, rng));
            pool.add(createDynamicQuestion("Which practice ensures zero downtime during production software releases?",
                    Arrays.asList("Blue-Green or Canary Deployments", "Shutting down servers during peak hours", "Hardcoding database credentials", "Disabling automated logging"),
                    "Blue-Green and Canary strategies route traffic gradually to new releases without interrupting service.", domain, difficulty, rng));
            pool.add(createDynamicQuestion("In distributed computing, what does the CAP theorem state regarding partition tolerance?",
                    Arrays.asList("A distributed system can guarantee at most two of Consistency, Availability, and Partition Tolerance simultaneously", "All databases must be ACID compliant", "Networks never experience latency or packet loss", "Microservices must share a single database"),
                    "Under network partitions, a distributed system must choose between strict Consistency or continuous Availability.", domain, difficulty, rng));
            pool.add(createDynamicQuestion("What is the primary purpose of an Asynchronous Message Queue (e.g. Kafka, RabbitMQ)?",
                    Arrays.asList("Decouple producer and consumer services, buffer traffic spikes, and enable reliable background processing", "Render HTML templates in the browser", "Replace relational database indexes", "Encrypt client SSL connections"),
                    "Message brokers decouple services and prevent cascading failures by buffering asynchronous workloads.", domain, difficulty, rng));
        }

        // Shuffle question pool randomly every single execution
        Collections.shuffle(pool, rng);

        int selectedCount = Math.min(count, pool.size());
        List<Map<String, Object>> selectedQuestions = new ArrayList<>(pool.subList(0, selectedCount));

        // Assign randomized unique question IDs
        for (int i = 0; i < selectedQuestions.size(); i++) {
            Map<String, Object> q = selectedQuestions.get(i);
            q.put("id", "q_" + (i + 1) + "_" + UUID.randomUUID().toString().substring(0, 6));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("domain", domain);
        result.put("difficulty", difficulty);
        result.put("questions", selectedQuestions);
        return result;
    }

    private Map<String, Object> createDynamicQuestion(String text, List<String> originalOptions, String explanation, String skill, String difficulty, Random rng) {
        String correctText = originalOptions.get(0); // Index 0 is always the correct option in template
        List<String> shuffledOptions = new ArrayList<>(originalOptions);
        Collections.shuffle(shuffledOptions, rng); // Randomize option positions A, B, C, D

        int newCorrectIdx = shuffledOptions.indexOf(correctText);

        Map<String, Object> q = new HashMap<>();
        q.put("id", "q_" + UUID.randomUUID().toString().substring(0, 8));
        q.put("questionText", text);
        q.put("options", shuffledOptions);
        q.put("correctOptionIndex", newCorrectIdx);
        q.put("explanation", explanation);
        q.put("targetSkill", skill);
        q.put("difficulty", difficulty);
        return q;
    }
}
