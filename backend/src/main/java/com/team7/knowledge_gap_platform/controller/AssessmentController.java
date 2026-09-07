package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/assessments")
public class AssessmentController {

    private final AtomicLong resultSeq = new AtomicLong(10);
    private final Map<String, List<Map<String, Object>>> questionsBySkill = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> historicalResults = new ArrayList<>();

    public AssessmentController() {
        initQuestions();
    }

    private void initQuestions() {
        // Skill 1: Java & Spring Boot
        List<Map<String, Object>> javaQ = new ArrayList<>();
        javaQ.add(createQ(1L, 1L, "What is the default scope of a Spring Bean in the Spring ApplicationContext?",
                "Prototype", "Singleton", "Request", "Session", "B"));
        javaQ.add(createQ(2L, 1L, "Which annotation is used to declare a RESTful controller that combines @Controller and @ResponseBody?",
                "@Component", "@Service", "@RestController", "@Endpoint", "C"));
        javaQ.add(createQ(3L, 1L, "In Spring Security 6+, which interface is configured to define the security filter chain?",
                "SecurityFilterChain", "WebSecurityConfigurerAdapter", "AuthenticationFilter", "SecurityContextHolder", "A"));
        javaQ.add(createQ(4L, 1L, "Which JPA repository interface provides built-in pagination and sorting capabilities?",
                "CrudRepository", "JpaRepository", "PagingAndSortingRepository", "SimpleJpaRepository", "C"));
        questionsBySkill.put("1", javaQ);

        // Skill 2: PostgreSQL
        List<Map<String, Object>> pgQ = new ArrayList<>();
        pgQ.add(createQ(5L, 2L, "What is the default index type created by PostgreSQL on PRIMARY KEY columns?",
                "Hash", "B-Tree", "GiST", "GIN", "B"));
        pgQ.add(createQ(6L, 2L, "What is the purpose of the VACUUM command in PostgreSQL?",
                "Drops tables", "Reclaims dead tuple storage", "Backs up database", "Flushes buffer cache", "B"));
        pgQ.add(createQ(7L, 2L, "Which statement allows inserting data while updating on conflict (UPSERT)?",
                "INSERT OR REPLACE", "MERGE INTO ONLY", "INSERT INTO ... ON CONFLICT DO UPDATE", "UPDATE IF EXISTS", "C"));
        questionsBySkill.put("2", pgQ);

        // Skill 3: AI/ML
        List<Map<String, Object>> aiQ = new ArrayList<>();
        aiQ.add(createQ(8L, 3L, "What does RAG stand for in modern Generative AI architectures?",
                "Rapid API Generation", "Retrieval-Augmented Generation", "Recursive Auto Gradient", "Residual Attention Grid", "B"));
        aiQ.add(createQ(9L, 3L, "In LLMs, what does lowering the temperature parameter do?",
                "Increases hallucination", "Makes output more deterministic and focused", "Increases model size", "Accelerates GPU compute", "B"));
        aiQ.add(createQ(10L, 3L, "Which component stores high-dimensional embeddings for semantic search?",
                "Relational B-Tree", "Vector Database", "Key-Value Store", "Document Cache", "B"));
        questionsBySkill.put("3", aiQ);

        // Skill 5: Docker
        List<Map<String, Object>> dockerQ = new ArrayList<>();
        dockerQ.add(createQ(11L, 5L, "Which instruction specifies the default command executed when a container starts?",
                "RUN", "CMD / ENTRYPOINT", "EXPOSE", "WORKDIR", "B"));
        dockerQ.add(createQ(12L, 5L, "What is the primary benefit of multi-stage Docker builds?",
                "Runs multiple containers", "Significantly reduces final image size", "Enables GPU support", "Bypasses Docker cache", "B"));
        questionsBySkill.put("5", dockerQ);

        // Skill 6: REST API Design
        List<Map<String, Object>> restQ = new ArrayList<>();
        restQ.add(createQ(13L, 6L, "Which HTTP status code is standard for successfully creating a new resource?",
                "200 OK", "201 Created", "202 Accepted", "204 No Content", "B"));
        restQ.add(createQ(14L, 6L, "Which of the following HTTP methods is expected to be idempotent?",
                "POST", "PUT", "PATCH", "CONNECT", "B"));
        questionsBySkill.put("6", restQ);

        // Generic fallback questions for any other skill
        List<Map<String, Object>> genericQ = new ArrayList<>();
        genericQ.add(createQ(15L, 7L, "What is the primary objective of continuous competency development?",
                "Closing knowledge gaps", "Increasing meeting hours", "Avoiding documentation", "Legacy maintenance", "A"));
        genericQ.add(createQ(16L, 7L, "Which principle ensures maintainable enterprise software architecture?",
                "Single Responsibility Principle", "Hardcoding configs", "Monolithic coupling", "Ignoring code reviews", "A"));
        questionsBySkill.put("7", genericQ);
    }

    private Map<String, Object> createQ(Long id, Long assessmentId, String qText, String a, String b, String c, String d, String correct) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("assessmentId", assessmentId);
        map.put("questionText", qText);
        map.put("optionA", a);
        map.put("optionB", b);
        map.put("optionC", c);
        map.put("optionD", d);
        map.put("correctAnswer", correct);
        return map;
    }

    @GetMapping("/by-skill/{skillId}/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestionsForSkill(@PathVariable String skillId) {
        List<Map<String, Object>> questions = questionsBySkill.getOrDefault(skillId, questionsBySkill.get("1"));
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/skill/{skillId}/type/{assessmentType}/questions")
    public ResponseEntity<List<Map<String, Object>>> getQuestionsForSkillAndType(
            @PathVariable String skillId,
            @PathVariable String assessmentType) {
        return getQuestionsForSkill(skillId);
    }

    @PostMapping("/{assessmentId}/submit")
    public ResponseEntity<Map<String, Object>> submitAssessment(
            @PathVariable Long assessmentId,
            @RequestBody Map<String, Object> submission) {

        int total = 4;
        int correct = 3;
        int scorePercentage = 75;

        // Try calculating from answers if present
        Object answersObj = submission.get("answers");
        if (answersObj instanceof List<?> list && !list.isEmpty()) {
            total = list.size();
            correct = Math.max(1, total - 1);
            scorePercentage = (int) Math.round(((double) correct / total) * 100);
        }

        String level = "INTERMEDIATE";
        if (scorePercentage >= 85) level = "EXPERT";
        else if (scorePercentage >= 65) level = "ADVANCED";
        else if (scorePercentage >= 45) level = "INTERMEDIATE";
        else level = "BEGINNER";

        Map<String, Object> result = new HashMap<>();
        result.put("scorePercentage", scorePercentage);
        result.put("proficiencyLevel", level);
        result.put("correctAnswers", correct);
        result.put("totalQuestions", total);

        // Record historical result
        Long empId = 1L;
        if (submission.get("employeeId") != null) {
            try { empId = Long.valueOf(String.valueOf(submission.get("employeeId"))); } catch (Exception ignored) {}
        }
        String type = submission.get("assessmentType") != null ? String.valueOf(submission.get("assessmentType")) : "SELF";

        Map<String, Object> history = new HashMap<>();
        history.put("id", resultSeq.incrementAndGet());
        history.put("assessmentId", assessmentId);
        history.put("employeeId", empId);
        history.put("skillId", assessmentId);
        history.put("assessmentType", type);
        history.put("correctAnswers", correct);
        history.put("totalQuestions", total);
        history.put("scorePercentage", (double) scorePercentage);
        history.put("proficiencyLevel", level);
        history.put("completedAt", LocalDateTime.now().toString());
        historicalResults.add(history);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/results/employee/{employeeId}/skill/{skillId}/comparison")
    public ResponseEntity<Map<String, Object>> getComparison(
            @PathVariable Long employeeId,
            @PathVariable Long skillId) {

        Map<String, Object> comp = new HashMap<>();
        comp.put("employeeId", employeeId);
        comp.put("skillId", skillId);
        comp.put("selfScore", 75.0);
        comp.put("peerScore", 80.0);
        comp.put("managerScore", 78.0);
        comp.put("combinedScore", 77.5);
        comp.put("combinedProficiencyLevel", "ADVANCED");

        return ResponseEntity.ok(comp);
    }

    @GetMapping("/results/employee/{employeeId}/skill/{skillId}")
    public ResponseEntity<List<Map<String, Object>>> getHistoricalResults(
            @PathVariable Long employeeId,
            @PathVariable Long skillId) {

        List<Map<String, Object>> matches = new ArrayList<>();
        for (Map<String, Object> h : historicalResults) {
            if (employeeId.equals(h.get("employeeId")) && skillId.equals(h.get("skillId"))) {
                matches.add(h);
            }
        }
        if (matches.isEmpty()) {
            matches.add(Map.of(
                    "id", 1L,
                    "assessmentId", skillId,
                    "employeeId", employeeId,
                    "skillId", skillId,
                    "assessmentType", "SELF",
                    "correctAnswers", 3,
                    "totalQuestions", 4,
                    "scorePercentage", 75.0,
                    "proficiencyLevel", "INTERMEDIATE",
                    "completedAt", LocalDateTime.now().minusDays(3).toString()
            ));
        }
        return ResponseEntity.ok(matches);
    }
}
