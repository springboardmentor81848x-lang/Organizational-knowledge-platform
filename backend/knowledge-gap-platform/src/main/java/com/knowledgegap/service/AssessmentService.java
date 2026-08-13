package com.knowledgegap.service;

import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentAnswer;
import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentQuestion;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.SkillResult;
import com.knowledgegap.repository.AssessmentAnswerRepository;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentQuestionRepository;
import com.knowledgegap.repository.AssessmentRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.SkillResultRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final SkillResultRepository skillResultRepository;
    private final EmployeeRepository employeeRepository;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository questionRepository,
            AssessmentAttemptRepository attemptRepository,
            AssessmentAnswerRepository answerRepository,
            SkillResultRepository skillResultRepository,
            EmployeeRepository employeeRepository) {

        this.assessmentRepository = assessmentRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.answerRepository = answerRepository;
        this.skillResultRepository = skillResultRepository;
        this.employeeRepository = employeeRepository;
    }

    /*
     * Get the currently active assessment.
     *
     * IMPORTANT:
     * correctAnswer is removed before sending the questions
     * to the frontend.
     */
    public Map<String, Object> getCurrentAssessment() {

        Assessment assessment = assessmentRepository
                .findFirstByActiveTrueOrderByIdDesc()
                .orElseThrow(() ->
                        new RuntimeException("No active assessment found"));

        List<AssessmentQuestion> questions =
                questionRepository.findByAssessmentIdOrderByIdAsc(
                        assessment.getId());

        List<Map<String, Object>> safeQuestions = new ArrayList<>();

        for (AssessmentQuestion question : questions) {

            Map<String, Object> q = new LinkedHashMap<>();

            q.put("id", question.getId());
            q.put("skillName", question.getSkillName());
            q.put("question", question.getQuestion());
            q.put("optionA", question.getOptionA());
            q.put("optionB", question.getOptionB());
            q.put("optionC", question.getOptionC());
            q.put("optionD", question.getOptionD());
            q.put("difficulty", question.getDifficulty());
            q.put("marks", question.getMarks());

            // DO NOT send correctAnswer
            safeQuestions.add(q);
        }

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("assessmentId", assessment.getId());
        result.put("title", assessment.getTitle());
        result.put("description", assessment.getDescription());
        result.put("durationMinutes", assessment.getDurationMinutes());
        result.put("totalQuestions", questions.size());
        result.put("questions", safeQuestions);

        return result;
    }


    /*
     * Submit assessment.
     */
    @Transactional
    public Map<String, Object> submitAssessment(
            String email,
            Long assessmentId,
            List<Map<String, Object>> submittedAnswers) {

        Employee employee = employeeRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        Assessment assessment = assessmentRepository
                .findById(assessmentId)
                .orElseThrow(() ->
                        new RuntimeException("Assessment not found"));

        List<AssessmentQuestion> questions =
                questionRepository
                        .findByAssessmentIdOrderByIdAsc(assessmentId);

        if (questions.isEmpty()) {
            throw new RuntimeException(
                    "No questions found for this assessment");
        }

        /*
         * Convert submitted answers into a map:
         *
         * questionId -> selected answer
         */
        Map<Long, String> answerMap = new HashMap<>();

        if (submittedAnswers != null) {

            for (Map<String, Object> answer : submittedAnswers) {

                Object questionIdObject = answer.get("questionId");
                Object selectedAnswerObject =
                        answer.get("selectedAnswer");

                if (questionIdObject == null) {
                    continue;
                }

                Long questionId =
                        Long.valueOf(questionIdObject.toString());

                String selectedAnswer =
                        selectedAnswerObject == null
                                ? null
                                : selectedAnswerObject.toString();

                answerMap.put(questionId, selectedAnswer);
            }
        }

        /*
         * Create a new attempt.
         *
         * Every retake creates a NEW attempt.
         */
        AssessmentAttempt attempt = new AssessmentAttempt();

        attempt.setEmployeeId(employee.getId());
        attempt.setAssessmentId(assessmentId);

        AssessmentAttempt savedAttempt =
                attemptRepository.save(attempt);

        /*
         * Skill-wise counters.
         */
        Map<String, Integer> skillCorrect = new HashMap<>();
        Map<String, Integer> skillTotal = new HashMap<>();

        int totalCorrect = 0;
        int totalMarks = 0;

        /*
         * Evaluate every question.
         */
        for (AssessmentQuestion question : questions) {

            String skill = question.getSkillName();

            int marks = question.getMarks() == null
                    ? 1
                    : question.getMarks();

            totalMarks += marks;

            skillTotal.put(
                    skill,
                    skillTotal.getOrDefault(skill, 0) + marks
            );

            String selectedAnswer =
                    answerMap.get(question.getId());

            boolean correct =
                    selectedAnswer != null
                            && selectedAnswer.trim()
                            .equalsIgnoreCase(
                                    question.getCorrectAnswer().trim()
                            );

            if (correct) {

                totalCorrect += marks;

                skillCorrect.put(
                        skill,
                        skillCorrect.getOrDefault(skill, 0) + marks
                );
            }

            /*
             * Save individual answer.
             */
            AssessmentAnswer answer =
                    new AssessmentAnswer();

            answer.setAttemptId(savedAttempt.getId());
            answer.setQuestionId(question.getId());
            answer.setSelectedAnswer(selectedAnswer);
            answer.setCorrect(correct);

            answerRepository.save(answer);
        }

        /*
         * Overall percentage.
         */
        double overallScore = totalMarks == 0
                ? 0
                : ((double) totalCorrect / totalMarks) * 100;

        overallScore = round(overallScore);

        String performanceLevel =
                calculatePerformance(overallScore);

        savedAttempt.setOverallScore(overallScore);
        savedAttempt.setPerformanceLevel(performanceLevel);
        savedAttempt.setCompletedAt(LocalDateTime.now());

        attemptRepository.save(savedAttempt);

        /*
         * Skill-wise result and gap analysis.
         *
         * Required score = 70%.
         */
        final double REQUIRED_SCORE = 70.0;

        List<Map<String, Object>> skillResults =
                new ArrayList<>();

        for (String skill : skillTotal.keySet()) {

            int total = skillTotal.get(skill);

            int correct =
                    skillCorrect.getOrDefault(skill, 0);

            double actualScore =
                    total == 0
                            ? 0
                            : ((double) correct / total) * 100;

            actualScore = round(actualScore);

            double gap =
                    Math.max(0, REQUIRED_SCORE - actualScore);

            gap = round(gap);

            String severity =
                    calculateGapSeverity(gap);

            SkillResult skillResult =
                    new SkillResult();

            skillResult.setAttemptId(
                    savedAttempt.getId());

            skillResult.setSkillName(skill);

            skillResult.setActualScore(actualScore);

            skillResult.setRequiredScore(REQUIRED_SCORE);

            skillResult.setGap(gap);

            skillResult.setGapSeverity(severity);

            skillResultRepository.save(skillResult);

            Map<String, Object> result =
                    new LinkedHashMap<>();

            result.put("skillName", skill);
            result.put("actualScore", actualScore);
            result.put("requiredScore", REQUIRED_SCORE);
            result.put("gap", gap);
            result.put("gapSeverity", severity);

            skillResults.add(result);
        }

        /*
         * Final response.
         */
        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("attemptId", savedAttempt.getId());
        response.put("employeeId", employee.getId());
        response.put("employeeName",
                employee.getFirstName() + " "
                        + employee.getLastName());

        response.put("assessmentId", assessmentId);

        response.put("totalQuestions", questions.size());

        response.put("correctAnswers", totalCorrect);

        response.put("overallScore", overallScore);

        response.put(
                "performanceLevel",
                performanceLevel
        );

        response.put(
                "skillResults",
                skillResults
        );

        return response;
    }


    /*
     * Performance classification.
     */
    private String calculatePerformance(double score) {

        if (score >= 85) {
            return "EXCELLENT";
        }

        if (score >= 70) {
            return "GOOD";
        }

        if (score >= 50) {
            return "AVERAGE";
        }

        return "NEEDS IMPROVEMENT";
    }


    /*
     * Gap classification.
     */
    private String calculateGapSeverity(double gap) {

        if (gap <= 0) {
            return "NO GAP";
        }

        if (gap <= 10) {
            return "LOW";
        }

        if (gap <= 20) {
            return "MEDIUM";
        }

        return "HIGH";
    }


    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }


    /*
     * Latest assessment result.
     */
    public Map<String, Object> getLatestResult(
            String email) {

        Employee employee = employeeRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        AssessmentAttempt attempt =
                attemptRepository
                        .findFirstByEmployeeIdOrderByCompletedAtDesc(
                                employee.getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No assessment attempt found"));

        return buildResult(attempt, employee);
    }


    /*
     * Assessment history.
     */
    public List<Map<String, Object>> getAssessmentHistory(
            String email) {

        Employee employee = employeeRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        List<AssessmentAttempt> attempts =
                attemptRepository
                        .findByEmployeeIdOrderByCompletedAtDesc(
                                employee.getId());

        List<Map<String, Object>> history =
                new ArrayList<>();

        for (AssessmentAttempt attempt : attempts) {

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put("attemptId", attempt.getId());
            item.put("assessmentId",
                    attempt.getAssessmentId());
            item.put("overallScore",
                    attempt.getOverallScore());
            item.put("performanceLevel",
                    attempt.getPerformanceLevel());
            item.put("completedAt",
                    attempt.getCompletedAt());

            history.add(item);
        }

        return history;
    }


    /*
     * Build complete result from a saved attempt.
     */
    private Map<String, Object> buildResult(
            AssessmentAttempt attempt,
            Employee employee) {

        List<SkillResult> results =
                skillResultRepository
                        .findByAttemptId(attempt.getId());

        List<Map<String, Object>> skillResults =
                new ArrayList<>();

        for (SkillResult result : results) {

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put("skillName",
                    result.getSkillName());

            item.put("actualScore",
                    result.getActualScore());

            item.put("requiredScore",
                    result.getRequiredScore());

            item.put("gap",
                    result.getGap());

            item.put("gapSeverity",
                    result.getGapSeverity());

            skillResults.add(item);
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("attemptId", attempt.getId());

        response.put("employeeId",
                employee.getId());

        response.put("employeeName",
                employee.getFirstName()
                        + " "
                        + employee.getLastName());

        response.put("assessmentId",
                attempt.getAssessmentId());

        response.put("overallScore",
                attempt.getOverallScore());

        response.put("performanceLevel",
                attempt.getPerformanceLevel());

        response.put("completedAt",
                attempt.getCompletedAt());

        response.put("skillResults",
                skillResults);

        return response;
    }
}
