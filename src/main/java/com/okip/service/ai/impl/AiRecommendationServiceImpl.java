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
import java.util.List;

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

import com.okip.enums.GapType;

import com.okip.exception.ResourceNotFoundException;

import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.repository.TrainingRepository;

@Service
public class AiRecommendationServiceImpl
        implements AiRecommendationService {

    private final ChatModel chatModel;
 

    private final EmployeeRepository employeeRepository;

    private final EmployeeJobRoleRepository employeeJobRoleRepository;

    private final KnowledgeGapRepository knowledgeGapRepository;

    private final TrainingRepository trainingRepository;

    private final ObjectMapper objectMapper;

    public AiRecommendationServiceImpl(
            ChatModel chatModel,
            EmployeeRepository employeeRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            TrainingRepository trainingRepository,
            ObjectMapper objectMapper) {

        this.chatModel = chatModel;
        this.employeeRepository = employeeRepository;
        this.employeeJobRoleRepository =
                employeeJobRoleRepository;
        this.knowledgeGapRepository =
                knowledgeGapRepository;
        this.trainingRepository =
                trainingRepository;
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

        List<KnowledgeGap> gaps =
                knowledgeGapRepository
                        .findByEmployeeJobRoleIn(
                                assignedRoles);

        if (gaps.isEmpty()) {

            throw new ResourceNotFoundException(
                    "No knowledge gaps found. " +
                    "Run gap analysis first.");
        }

        List<Training> trainings =
                trainingRepository.findAll();

        String prompt =
                buildRecommendationPrompt(
                        employee,
                        gaps,
                        trainings);

        String aiJson = callGemini(prompt);

        return parseAiResponse(
                aiJson,
                employee,
                trainings);
    }

    @Override
    public AiRecommendationResponseDTO generateMyRecommendation() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Employee employee = employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found."));
        return generateRecommendation(employee.getEmployeeId());
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

            prompt.append("\n");
        }

        prompt.append("""
                
                RULES:

                1. Prioritize the largest knowledge gaps.
                2. Consider missing skills before low experience.
                3. Build the learning path from foundational
                   knowledge to advanced knowledge.
                4. Recommend only relevant training IDs.
                5. Do not invent courses.
                6. Do not invent training IDs.
                7. Return only valid JSON.
                """);

        return prompt.toString();
    }
    private String callGemini(String prompt) {

        ChatResponse response =
                chatModel.call(
                        new Prompt(prompt));

        return response.getResult()
                .getOutput()
                .getText();
    }
    private AiRecommendationResponseDTO parseAiResponse(
            String aiJson,
            Employee employee,
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