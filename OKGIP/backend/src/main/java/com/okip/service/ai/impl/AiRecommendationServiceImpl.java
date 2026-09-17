package com.okip.service.ai.impl;

import java.util.List;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import com.okip.entity.transaction.KnowledgeGap;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.service.ai.AiRecommendationService;
import java.util.ArrayList;
import java.util.Comparator;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.okip.dto.ai.AiRecommendationResponseDTO;
import com.okip.dto.ai.LearningPathDTO;
import com.okip.dto.ai.PriorityGapDTO;
import com.okip.dto.ai.RecommendedCourseDTO;

import com.okip.entity.master.Employee;
import com.okip.entity.master.Training;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.entity.transaction.TrainingSkill;

import com.okip.enums.GapType;

import com.okip.exception.ResourceNotFoundException;

import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.repository.TrainingRepository;
import com.okip.repository.TrainingSkillRepository;

@Service
public class AiRecommendationServiceImpl
        implements AiRecommendationService {

    private final ChatModel chatModel;
 

    private final EmployeeRepository employeeRepository;

    private final EmployeeJobRoleRepository employeeJobRoleRepository;

    private final KnowledgeGapRepository knowledgeGapRepository;

    private final TrainingRepository trainingRepository;

    private final TrainingSkillRepository trainingSkillRepository;

    private final ObjectMapper objectMapper;

    public AiRecommendationServiceImpl(
            ChatModel chatModel,
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            TrainingRepository trainingRepository,
            TrainingSkillRepository trainingSkillRepository,
            ObjectMapper objectMapper) {

        this.chatModel = chatModel;
        this.employeeRepository = employeeRepository;
        this.employeeJobRoleRepository =
                employeeJobRoleRepository;
        this.knowledgeGapRepository =
                knowledgeGapRepository;
        this.trainingRepository =
                trainingRepository;
        this.trainingSkillRepository =
                trainingSkillRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public AiRecommendationResponseDTO generateRecommendation(
            Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));

        List<EmployeeJobRole> assignedRoles =
                employeeJobRoleRepository
                        .findByEmployeeAndActiveTrue(employee);

        if (assignedRoles.isEmpty()) {

            throw new ResourceNotFoundException(
                    "No active job role assigned.");
        }

        List<KnowledgeGap> allGaps =
                knowledgeGapRepository
                        .findByEmployeeJobRoleIn(
                                assignedRoles);

        if (allGaps.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No knowledge-gap analysis exists for this employee. Run gap analysis first.");
        }

        // AI must only reason over active gaps. CLOSED/0% records are evidence
        // that the employee already meets the requirement and must not generate
        // a course recommendation.
        List<KnowledgeGap> gaps = allGaps.stream()
                .filter(g -> g.getGapPercentage() != null && g.getGapPercentage() > 0.0)
                .filter(g -> g.getStatus() == null || "OPEN".equals(g.getStatus().name()))
                .toList();

        List<Training> trainings =
                trainingRepository.findAll();

        if (gaps.isEmpty()) {
            AiRecommendationResponseDTO response = new AiRecommendationResponseDTO();
            response.setEmployeeId(employee.getEmployeeId());
            response.setEmployeeCode(employee.getEmployeeCode());
            response.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
            response.setPriorityGaps(new ArrayList<>());
            response.setLearningPath(new ArrayList<>());
            response.setRecommendedCourses(new ArrayList<>());
            return response;
        }

        String prompt =
                buildRecommendationPrompt(
                        employee,
                        gaps,
                        trainings);

        String aiJson = callGemini(prompt);

        return parseAiResponse(
                aiJson,
                employee,
                gaps,
                trainings);
    }

    @Override
    public String generateRoleLearningPath(
            String desiredRole) {

        String prompt =
                """
                You are an AI learning recommendation assistant
                for an Organizational Knowledge Gap Intelligence Platform.

                An employee wants to become:

                %s

                Create a practical learning path for this role.

                Include:

                1. Important skills required for the role.
                2. Recommended learning order.
                3. Beginner, intermediate and advanced stages.
                4. Recommended courses or learning resources.
                5. Suitable learning platforms.
                6. Estimated learning duration.
                7. Practical projects to build.
                8. Expected skills after completing the path.

                Keep the recommendations practical and
                beginner-friendly.

                Do not invent exact course URLs.

                If you are not certain about a specific course,
                recommend the platform and course topic instead.

                Return the answer in clear sections.
                """
                .formatted(desiredRole);

        return callGemini(prompt);
    }

    private String buildRecommendationPrompt(
            Employee employee,
            List<KnowledgeGap> gaps,
            List<Training> trainings) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("""
                You are the AI recommendation engine for an
                Organizational Knowledge Gap Intelligence Platform.

                Analyze the employee's knowledge gaps and create
                a personalized learning recommendation.

                IMPORTANT:
                Return ONLY valid JSON.
                Do not use markdown.
                Do not use ```json.
                Do not add explanations outside the JSON.

                Required JSON structure:

                {
                  "priorityGaps": [
                    {
                      "skillName": "",
                      "gapType": "",
                      "gapPercentage": 0,
                      "priority": ""
                    }
                  ],
                  "learningPath": [
                    {
                      "phase": 1,
                      "title": "",
                      "duration": "",
                      "reason": ""
                    }
                  ],
                  "recommendedCourses": [
                    {
                      "trainingId": 1
                    }
                  ]
                }

                Priority must be one of:
                HIGH, MEDIUM, LOW.

                Only recommend training IDs from the
                AVAILABLE TRAINING list.

                Do not invent training IDs.

                Employee:
                """);

        prompt.append(employee.getFirstName())
                .append(" ")
                .append(employee.getLastName())
                .append("\n\n");

        prompt.append("KNOWLEDGE GAPS:\n");

        gaps.stream()
                .sorted(Comparator.comparing(
                        KnowledgeGap::getGapPercentage,
                        Comparator.reverseOrder()))
                .forEach(gap -> {

                    prompt.append("\nSkill: ")
                            .append(
                                    gap.getSkill()
                                            .getSkillName());

                    prompt.append("\nGap Type: ")
                            .append(gap.getGapType());

                    prompt.append("\nGap Percentage: ")
                            .append(gap.getGapPercentage());

                    prompt.append("\nCurrent Proficiency: ")
                            .append(
                                    gap.getCurrentProficiency());

                    prompt.append("\nRequired Proficiency: ")
                            .append(
                                    gap.getRequiredProficiency());

                    prompt.append("\nCurrent Experience: ")
                            .append(
                                    gap.getCurrentExperience());

                    prompt.append("\nRequired Experience: ")
                            .append(
                                    gap.getRequiredExperience());

                    prompt.append("\n");
                });

        prompt.append("\nAVAILABLE TRAINING:\n");

        for (Training training : trainings) {

            prompt.append("\nTraining ID: ")
                    .append(training.getTrainingId());

            prompt.append("\nName: ")
                    .append(training.getTrainingName());

            prompt.append("\nProvider: ")
                    .append(training.getProvider());

            prompt.append("\nLevel: ")
                    .append(training.getLevel());

            prompt.append("\nDuration: ")
                    .append(training.getDuration());

            prompt.append("\nDescription: ")
                    .append(training.getDescription());

            List<TrainingSkill> mappings =
                    trainingSkillRepository.findByTrainingWithSkill(training);

            prompt.append("\nMapped Skills: ");
            if (mappings.isEmpty()) {
                prompt.append("NONE");
            } else {
                prompt.append(
                        mappings.stream()
                                .map(mapping -> mapping.getSkill().getSkillName())
                                .distinct()
                                .sorted()
                                .collect(java.util.stream.Collectors.joining(", ")));
            }

            prompt.append("\n");
        }

        prompt.append("""
        
        RULES:

        1. Prioritize only skills that have an actual knowledge gap.
        2. Do NOT create learning recommendations for skills with
           gapPercentage = 0 or status = CLOSED.
        3. For every learning recommendation, use the employee's
           CURRENT PROFICIENCY and REQUIRED PROFICIENCY from the
           KNOWLEDGE GAPS data.
        4. Training level must support the employee's progression
           toward the required proficiency.
        5. Follow this proficiency progression:
           BEGINNER < INTERMEDIATE < ADVANCED < EXPERT.
        6. If the employee is BEGINNER and the required proficiency
           is INTERMEDIATE, prefer BEGINNER or INTERMEDIATE training.
        7. Do NOT recommend ADVANCED or EXPERT training as the first
           learning step when the employee only needs to reach
           INTERMEDIATE.
        8. If an appropriate INTERMEDIATE training is unavailable,
           prefer a relevant BEGINNER foundation course rather than
           jumping directly to ADVANCED training.
        9. If the employee is already at the required proficiency,
           do not recommend a course for that skill.
        10. Match training relevance using the training name,
            description, and level against the actual knowledge gap.
        11. Recommend only training IDs from the AVAILABLE TRAINING list.
        12. Never invent a training ID.
        13. Never invent a course.
        14. The learning path must progress from the employee's
            current proficiency toward the required proficiency.
        15. Recommended courses should support the learning path.
        16. Do not recommend unrelated courses.
        17. Return only valid JSON.
        """);

        return prompt.toString();
    }
   private String callGemini(String prompt) {

    try {

        System.out.println("=================================");
        System.out.println("GEMINI REQUEST STARTED");
        System.out.println("Prompt length = " + prompt.length());
        System.out.println("=================================");

        ChatResponse response =
                chatModel.call(
                        new Prompt(prompt));

        System.out.println("=================================");
        System.out.println("GEMINI RESPONSE RECEIVED");
        System.out.println(response);
        System.out.println("=================================");

        if (response == null) {
            throw new RuntimeException("Gemini returned null response.");
        }

        if (response.getResult() == null) {
            throw new RuntimeException("Gemini returned no result.");
        }

        if (response.getResult().getOutput() == null) {
            throw new RuntimeException("Gemini returned no output.");
        }

        String text =
                response.getResult()
                        .getOutput()
                        .getText();

        if (text == null || text.isBlank()) {
            throw new RuntimeException(
                    "Gemini returned empty content.");
        }

        return text;

    } catch (Exception ex) {

        System.err.println("=================================");
        System.err.println("GEMINI ERROR");
        System.err.println("=================================");
        ex.printStackTrace();
        System.err.println("=================================");

        throw new RuntimeException(
                "Gemini API failed: " + ex.getMessage(),
                ex);
    }
}
    private AiRecommendationResponseDTO parseAiResponse(
            String aiJson,
            Employee employee,
            List<KnowledgeGap> gaps,
            List<Training> trainings) {

        try {

            String cleanJson = cleanJsonResponse(aiJson);

            AiRecommendationResponseDTO response =
                    objectMapper.readValue(
                            cleanJson,
                            AiRecommendationResponseDTO.class);

            response.setEmployeeId(
                    employee.getEmployeeId());

            response.setEmployeeCode(
                    employee.getEmployeeCode());

            response.setEmployeeName(
                    employee.getFirstName()
                            + " "
                            + employee.getLastName());

            validateRecommendedCourses(
                    response,
                    trainings);

            ensureGapRelevantCourses(
                    response,
                    gaps,
                    trainings);

            return response;

        } catch (Exception ex) {

            throw new RuntimeException(
                    "Unable to process AI recommendation.",
                    ex);
        }
    }
    private String cleanJsonResponse(String response) {

        String cleaned = response.trim();

        if (cleaned.startsWith("```json")) {

            cleaned = cleaned.substring(7);
        }

        if (cleaned.startsWith("```")) {

            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {

            cleaned = cleaned.substring(
                    0,
                    cleaned.length() - 3);
        }

        return cleaned.trim();
    }
    private void ensureGapRelevantCourses(
            AiRecommendationResponseDTO response,
            List<KnowledgeGap> gaps,
            List<Training> trainings) {

        if (response.getRecommendedCourses() == null) {
            response.setRecommendedCourses(new ArrayList<>());
        }

        for (KnowledgeGap gap : gaps) {
            if (gap.getGapPercentage() == null || gap.getGapPercentage() <= 0
                    || gap.getSkill() == null
                    || gap.getSkill().getSkillName() == null) {
                continue;
            }

            String gapSkill = gap.getSkill().getSkillName().trim();

            boolean alreadyCovered = response.getRecommendedCourses().stream()
                    .map(RecommendedCourseDTO::getTrainingId)
                    .filter(java.util.Objects::nonNull)
                    .map(id -> trainings.stream()
                            .filter(t -> id.equals(t.getTrainingId()))
                            .findFirst().orElse(null))
                    .filter(java.util.Objects::nonNull)
                    .anyMatch(training -> trainingSkillRepository
                            .findByTraining(training).stream()
                            .anyMatch(mapping -> mapping.getSkill() != null
                                    && gapSkill.equalsIgnoreCase(
                                            mapping.getSkill().getSkillName().trim())));

            if (alreadyCovered) {
                continue;
            }

            Training fallback = trainings.stream()
                    .filter(training -> trainingSkillRepository
                            .findByTraining(training).stream()
                            .anyMatch(mapping -> mapping.getSkill() != null
                                    && gapSkill.equalsIgnoreCase(
                                            mapping.getSkill().getSkillName().trim())))
                    .filter(training -> isSuitableTrainingLevel(
                            training.getLevel(),
                            gap.getCurrentProficiency(),
                            gap.getRequiredProficiency()))
                    .findFirst()
                    .orElse(null);

            if (fallback == null) {
                continue;
            }

            RecommendedCourseDTO course = new RecommendedCourseDTO();
            course.setTrainingId(fallback.getTrainingId());
            course.setTrainingName(fallback.getTrainingName());
            course.setProvider(fallback.getProvider());
            course.setLevel(fallback.getLevel());
            course.setDuration(fallback.getDuration());
            course.setCourseUrl(fallback.getCourseUrl());
            response.getRecommendedCourses().add(course);
        }
    }

    private boolean isSuitableTrainingLevel(
            String trainingLevel,
            Object currentProficiency,
            Object requiredProficiency) {

        if (trainingLevel == null) return true;

        int trainingRank = proficiencyRank(trainingLevel);
        int currentRank = proficiencyRank(String.valueOf(currentProficiency));
        int requiredRank = proficiencyRank(String.valueOf(requiredProficiency));

        if (trainingRank < 0) return true;
        if (requiredRank < 0) return true;

        // Do not jump far beyond the employee's target level.
        return trainingRank <= requiredRank && trainingRank >= Math.max(0, currentRank);
    }

    private int proficiencyRank(String value) {
        if (value == null) return -1;
        return switch (value.trim().toUpperCase()) {
            case "BEGINNER" -> 0;
            case "INTERMEDIATE" -> 1;
            case "ADVANCED" -> 2;
            case "EXPERT" -> 3;
            default -> -1;
        };
    }

    private void validateRecommendedCourses(
            AiRecommendationResponseDTO response,
            List<Training> trainings) {

        if (response.getRecommendedCourses() == null) {

            response.setRecommendedCourses(
                    new ArrayList<>());

            return;
        }

        List<RecommendedCourseDTO> validCourses =
                new ArrayList<>();

        for (RecommendedCourseDTO aiCourse :
                response.getRecommendedCourses()) {

            if (aiCourse.getTrainingId() == null) {
                continue;
            }

            Training training =
                    trainings.stream()
                            .filter(t ->
                                    t.getTrainingId()
                                            .equals(
                                                    aiCourse
                                                            .getTrainingId()))
                            .findFirst()
                            .orElse(null);

            if (training == null) {
                continue;
            }

            RecommendedCourseDTO course =
                    new RecommendedCourseDTO();

            course.setTrainingId(
                    training.getTrainingId());

            course.setTrainingName(
                    training.getTrainingName());

            course.setProvider(
                    training.getProvider());

            course.setLevel(
                    training.getLevel());

            course.setDuration(
                    training.getDuration());

            course.setCourseUrl(
                    training.getCourseUrl());

            validCourses.add(course);
        }

        response.setRecommendedCourses(validCourses);
    }
}