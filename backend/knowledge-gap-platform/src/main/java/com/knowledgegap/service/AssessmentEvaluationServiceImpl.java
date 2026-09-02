package com.knowledgegap.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.knowledgegap.dto.AssessmentAnswerRequest;
import com.knowledgegap.dto.AssessmentQuestionResponse;
import com.knowledgegap.dto.AssessmentSubmitRequest;
import com.knowledgegap.dto.AssessmentSubmitResponse;
import com.knowledgegap.dto.EmployeeAssessmentResponse;
import com.knowledgegap.dto.SkillAssessmentResult;
import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentQuestion;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.repository.AssessmentQuestionRepository;
import com.knowledgegap.repository.AssessmentRepository;
import com.knowledgegap.repository.EmployeeRepository;

@Service
public class AssessmentEvaluationServiceImpl
        implements AssessmentEvaluationService {

    private final AssessmentRepository assessmentRepository;

    private final AssessmentQuestionRepository
            assessmentQuestionRepository;

    private final EmployeeRepository employeeRepository;

    public AssessmentEvaluationServiceImpl(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            EmployeeRepository employeeRepository) {

        this.assessmentRepository =
                assessmentRepository;

        this.assessmentQuestionRepository =
                assessmentQuestionRepository;

        this.employeeRepository =
                employeeRepository;
    }

    // ============================================================
    // GET ROLE-SPECIFIC ASSESSMENT
    // ============================================================

    @Override
    public EmployeeAssessmentResponse
            getAssessmentForEmployee(Long employeeId) {

        Employee employee =
                employeeRepository
                        .findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found with ID: "
                                                + employeeId
                                )
                        );

        Long targetRoleId =
                employee.getTargetRoleId();

        if (targetRoleId == null) {

            throw new RuntimeException(
                    "Employee has no target role assigned."
            );
        }

        Assessment assessment =
                assessmentRepository
                        .findByAssessmentRoleIdAndActiveTrue(
                                targetRoleId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No active assessment found for target role ID: "
                                                + targetRoleId
                                )
                        );

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository
                        .findByAssessmentId(
                                assessment.getId()
                        );

        List<AssessmentQuestionResponse>
                questionResponses =
                new ArrayList<>();

        for (AssessmentQuestion question : questions) {

            AssessmentQuestionResponse response =
                    new AssessmentQuestionResponse(
                            question.getId(),
                            question.getSkillName(),
                            question.getQuestion(),
                            question.getOptionA(),
                            question.getOptionB(),
                            question.getOptionC(),
                            question.getOptionD(),
                            question.getDifficulty(),
                            question.getMarks()
                    );

            questionResponses.add(response);
        }

        return new EmployeeAssessmentResponse(
                assessment.getId(),
                assessment.getTitle(),
                assessment.getDescription(),
                assessment.getDurationMinutes(),
                assessment.getAssessmentRoleId(),
                questionResponses
        );
    }

    // ============================================================
    // SUBMIT ASSESSMENT
    // ============================================================

    @Override
    public AssessmentSubmitResponse submitAssessment(
            AssessmentSubmitRequest request) {

        // ========================================================
        // 1. VALIDATE REQUEST
        // ========================================================

        if (request == null) {
            throw new RuntimeException(
                    "Assessment submission request cannot be null."
            );
        }

        if (request.getEmployeeId() == null) {
            throw new RuntimeException(
                    "Employee ID is required."
            );
        }

        if (request.getAssessmentId() == null) {
            throw new RuntimeException(
                    "Assessment ID is required."
            );
        }

        // ========================================================
        // 2. FIND EMPLOYEE
        // ========================================================

        Employee employee =
                employeeRepository
                        .findById(request.getEmployeeId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found with ID: "
                                                + request.getEmployeeId()
                                )
                        );

        // ========================================================
        // 3. FIND ASSESSMENT
        // ========================================================

        Assessment assessment =
                assessmentRepository
                        .findById(request.getAssessmentId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found."
                                )
                        );

        // ========================================================
        // 4. MAKE SURE ASSESSMENT BELONGS TO EMPLOYEE ROLE
        // ========================================================

        if (employee.getTargetRoleId() == null) {

            throw new RuntimeException(
                    "Employee has no target role assigned."
            );
        }

        if (assessment.getAssessmentRoleId() == null) {

            throw new RuntimeException(
                    "Assessment has no role assigned."
            );
        }

        if (!assessment.getAssessmentRoleId()
                .equals(employee.getTargetRoleId())) {

            throw new RuntimeException(
                    "This assessment does not belong to the employee's target role."
            );
        }

        // ========================================================
        // 5. GET QUESTIONS
        // ========================================================

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository
                        .findByAssessmentId(
                                assessment.getId()
                        );

        if (questions == null || questions.isEmpty()) {

            throw new RuntimeException(
                    "No questions found for this assessment."
            );
        }

        // ========================================================
        // 6. GET SUBMITTED ANSWERS
        // ========================================================

        List<AssessmentAnswerRequest> submittedAnswers =
                request.getAnswers();

        if (submittedAnswers == null) {
            submittedAnswers = new ArrayList<>();
        }

        // ========================================================
        // 7. VARIABLES
        // ========================================================

        int totalQuestions =
                questions.size();

        int correctAnswers = 0;

        int totalMarks = 0;

        int obtainedMarks = 0;

        // ========================================================
        // 8. SKILL-WISE COUNTERS
        // ========================================================

        Map<String, Integer> skillTotal =
                new LinkedHashMap<>();

        Map<String, Integer> skillCorrect =
                new LinkedHashMap<>();

        // ========================================================
        // 9. CHECK EVERY QUESTION
        // ========================================================

        for (AssessmentQuestion question : questions) {

            String skill =
                    question.getSkillName();

            if (skill == null || skill.trim().isEmpty()) {
                skill = "General";
            }

            int marks =
                    question.getMarks() == null
                            ? 1
                            : question.getMarks();

            totalMarks += marks;

            skillTotal.put(
                    skill,
                    skillTotal.getOrDefault(skill, 0) + 1
            );

            // ----------------------------------------------------
            // Find submitted answer for this question
            // ----------------------------------------------------

            String employeeAnswer =
                    findAnswerForQuestion(
                            submittedAnswers,
                            question.getId()
                    );

            // ----------------------------------------------------
            // Check answer
            // ----------------------------------------------------

            boolean correct =
                    employeeAnswer != null
                            && question.getCorrectAnswer() != null
                            && employeeAnswer.trim()
                                    .equalsIgnoreCase(
                                            question.getCorrectAnswer().trim()
                                    );

            if (correct) {

                correctAnswers++;

                obtainedMarks += marks;

                skillCorrect.put(
                        skill,
                        skillCorrect.getOrDefault(skill, 0) + 1
                );

            } else {

                skillCorrect.putIfAbsent(
                        skill,
                        0
                );
            }
        }

        // ========================================================
        // 10. OVERALL PERCENTAGE
        // ========================================================

        double overallPercentage = 0.0;

        if (totalMarks > 0) {

            overallPercentage =
                    ((double) obtainedMarks
                            / totalMarks) * 100.0;
        }

        // ========================================================
        // 11. OVERALL PROFICIENCY
        // ========================================================

        String overallLevel =
                calculateProficiencyLevel(
                        overallPercentage
                );

        // ========================================================
        // 12. SKILL-WISE RESULTS
        // ========================================================

        Map<String, SkillAssessmentResult>
                skillResults =
                new LinkedHashMap<>();

        for (String skill :
                skillTotal.keySet()) {

            int total =
                    skillTotal.get(skill);

            int correct =
                    skillCorrect.getOrDefault(
                            skill,
                            0
                    );

            double percentage = 0.0;

            if (total > 0) {

                percentage =
                        ((double) correct
                                / total) * 100.0;
            }

            String level =
                    calculateProficiencyLevel(
                            percentage
                    );

            SkillAssessmentResult result =
                    new SkillAssessmentResult(
                            skill,
                            total,
                            correct,
                            percentage,
                            level
                    );

            skillResults.put(
                    skill,
                    result
            );
        }

        // ========================================================
        // 13. CREATE RESPONSE
        // ========================================================

        AssessmentSubmitResponse response =
                new AssessmentSubmitResponse();

        response.setEmployeeId(
                employee.getId()
        );

        response.setAssessmentId(
                assessment.getId()
        );

        response.setTotalQuestions(
                totalQuestions
        );

        response.setCorrectAnswers(
                correctAnswers
        );

        response.setTotalMarks(
                totalMarks
        );

        response.setObtainedMarks(
                obtainedMarks
        );

        response.setOverallPercentage(
                overallPercentage
        );

        response.setOverallLevel(
                overallLevel
        );

        response.setSkillResults(
                skillResults
        );

        return response;
    }

    // ============================================================
    // FIND ANSWER FOR QUESTION
    // ============================================================

    private String findAnswerForQuestion(
            List<AssessmentAnswerRequest> answers,
            Long questionId) {

        if (answers == null || questionId == null) {
            return null;
        }

        for (AssessmentAnswerRequest answer : answers) {

            if (answer == null) {
                continue;
            }

            // ====================================================
            // FIX:
            // AssessmentAnswerRequest uses getSelectedAnswer()
            // ====================================================

            if (questionId.equals(answer.getQuestionId())) {

                return answer.getSelectedAnswer();
            }
        }

        return null;
    }

    // ============================================================
    // PROFICIENCY LEVEL CALCULATION
    // ============================================================

    private String calculateProficiencyLevel(
            double percentage) {

        if (percentage < 20) {
            return "Unaware";
        }

        if (percentage < 40) {
            return "Beginner";
        }

        if (percentage < 60) {
            return "Intermediate";
        }

        if (percentage < 80) {
            return "Advanced";
        }

        return "Expert";
    }
}