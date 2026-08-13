package com.knowledgegap.service;

import com.knowledgegap.dto.AssessmentAnswerRequest;
import com.knowledgegap.dto.AssessmentResultResponse;
import com.knowledgegap.dto.AssessmentSkillResultResponse;
import com.knowledgegap.dto.AssessmentSubmitRequest;
import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentAnswer;
import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.AssessmentQuestion;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.repository.AssessmentAnswerRepository;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentGapResultRepository;
import com.knowledgegap.repository.AssessmentQuestionRepository;
import com.knowledgegap.repository.AssessmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AssessmentAnswerRepository assessmentAnswerRepository;
    private final AssessmentGapResultRepository assessmentGapResultRepository;
    private final EmployeeService employeeService;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentAnswerRepository assessmentAnswerRepository,
            AssessmentGapResultRepository assessmentGapResultRepository,
            EmployeeService employeeService) {

        this.assessmentRepository = assessmentRepository;
        this.assessmentQuestionRepository = assessmentQuestionRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.assessmentAnswerRepository = assessmentAnswerRepository;
        this.assessmentGapResultRepository = assessmentGapResultRepository;
        this.employeeService = employeeService;
    }

    // =========================================================
    // ACTIVE ASSESSMENTS
    // =========================================================

    public List<Assessment> getActiveAssessments() {

        return assessmentRepository.findByActiveTrue();
    }

    // =========================================================
    // GET ASSESSMENT
    // =========================================================

    public Assessment getAssessmentById(Long id) {

        return assessmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assessment not found with id: " + id
                        ));
    }

    // =========================================================
    // GET QUESTIONS
    // =========================================================

    public List<AssessmentQuestion> getQuestionsByAssessment(
            Long assessmentId) {

        Assessment assessment =
                getAssessmentById(assessmentId);

        return assessmentQuestionRepository
                .findByAssessment(assessment);
    }

    // =========================================================
    // SUBMIT ASSESSMENT
    // =========================================================

    @Transactional
    public AssessmentResultResponse submitAssessment(
            AssessmentSubmitRequest request,
            String employeeIdentifier) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Assessment submission cannot be null."
            );
        }

        if (request.getAssessmentId() == null) {

            throw new IllegalArgumentException(
                    "Assessment ID is required."
            );
        }

        Assessment assessment =
                getAssessmentById(
                        request.getAssessmentId()
                );

        if (!Boolean.TRUE.equals(
                assessment.getActive())) {

            throw new IllegalStateException(
                    "This assessment is not active."
            );
        }

        Employee employee =
                employeeService
                        .getEmployeeByIdentifier(
                                employeeIdentifier
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                ));

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository
                        .findByAssessment(assessment);

        if (questions.isEmpty()) {

            throw new IllegalStateException(
                    "No questions found for this assessment."
            );
        }

        // =====================================================
        // CREATE ASSESSMENT ATTEMPT
        // =====================================================

        AssessmentAttempt attempt =
                new AssessmentAttempt();

        attempt.setEmployee(employee);

        attempt.setAssessment(assessment);

        attempt.setCompletedAt(
                LocalDateTime.now()
        );

        attempt.setOverallScore(0.0);

        attempt.setPerformanceLevel(
                "Not Calculated"
        );

        attempt =
                assessmentAttemptRepository.save(
                        attempt
                );

        // =====================================================
        // CREATE SUBMITTED ANSWERS MAP
        // =====================================================

        Map<Long, String> submittedAnswers =
                new HashMap<>();

        if (request.getAnswers() != null) {

            for (
                    AssessmentAnswerRequest answerRequest :
                    request.getAnswers()
            ) {

                if (
                        answerRequest != null &&
                        answerRequest.getQuestionId() != null
                ) {

                    submittedAnswers.put(
                            answerRequest.getQuestionId(),
                            answerRequest.getSelectedAnswer()
                    );
                }
            }
        }

        // =====================================================
        // SKILL CALCULATION
        // =====================================================

        Map<String, Integer> skillTotalMarks =
                new LinkedHashMap<>();

        Map<String, Integer> skillCorrectMarks =
                new LinkedHashMap<>();

        int totalMarks = 0;

        int obtainedMarks = 0;

        int correctAnswers = 0;

        // =====================================================
        // PROCESS QUESTIONS
        // =====================================================

        for (AssessmentQuestion question : questions) {

            int marks =
                    Optional.ofNullable(
                            question.getMarks()
                    ).orElse(1);

            totalMarks += marks;

            String selectedAnswer =
                    submittedAnswers.get(
                            question.getId()
                    );

            String correctAnswer =
                    question.getCorrectAnswer();

            boolean correct =
                    selectedAnswer != null &&
                    correctAnswer != null &&
                    selectedAnswer.trim()
                            .equalsIgnoreCase(
                                    correctAnswer.trim()
                            );

            if (correct) {

                obtainedMarks += marks;

                correctAnswers++;
            }

            String skillName =
                    question.getSkillName();

            if (
                    skillName == null ||
                    skillName.isBlank()
            ) {

                skillName = "Other";
            }

            // -------------------------------------------------
            // TOTAL MARKS FOR SKILL
            // -------------------------------------------------

            skillTotalMarks.put(
                    skillName,
                    skillTotalMarks.getOrDefault(
                            skillName,
                            0
                    ) + marks
            );

            // -------------------------------------------------
            // CORRECT MARKS FOR SKILL
            // -------------------------------------------------

            if (correct) {

                skillCorrectMarks.put(
                        skillName,
                        skillCorrectMarks.getOrDefault(
                                skillName,
                                0
                        ) + marks
                );
            }

            // -------------------------------------------------
            // SAVE ANSWER
            // -------------------------------------------------

            AssessmentAnswer answer =
                    new AssessmentAnswer();

            answer.setAttempt(attempt);

            answer.setQuestion(question);

            answer.setSelectedAnswer(
                    selectedAnswer
            );

            answer.setCorrect(correct);

            assessmentAnswerRepository.save(
                    answer
            );
        }

        // =====================================================
        // OVERALL SCORE
        // =====================================================

        double overallScore =
                totalMarks > 0
                        ? ((double) obtainedMarks /
                        totalMarks) * 100
                        : 0.0;

        overallScore =
                Math.round(
                        overallScore * 100.0
                ) / 100.0;

        String performanceLevel =
                getPerformanceLevel(
                        overallScore
                );

        attempt.setOverallScore(
                overallScore
        );

        attempt.setPerformanceLevel(
                performanceLevel
        );

        assessmentAttemptRepository.save(
                attempt
        );

        // =====================================================
        // SKILL GAP RESULTS
        // =====================================================

        List<AssessmentSkillResultResponse> skillResults =
                new ArrayList<>();

        for (
                Map.Entry<String, Integer> entry :
                skillTotalMarks.entrySet()
        ) {

            String skillName =
                    entry.getKey();

            int skillTotal =
                    entry.getValue();

            int skillCorrect =
                    skillCorrectMarks.getOrDefault(
                            skillName,
                            0
                    );

            // -------------------------------------------------
            // ACTUAL SKILL SCORE
            // -------------------------------------------------

            int actualScore =
                    skillTotal > 0
                            ? (int) Math.round(
                                    ((double) skillCorrect /
                                            skillTotal) * 100
                            )
                            : 0;

            // -------------------------------------------------
            // REQUIRED SCORE
            // -------------------------------------------------

            int requiredScore = 70;

            // -------------------------------------------------
            // GAP
            // -------------------------------------------------

            int gap =
                    Math.max(
                            requiredScore - actualScore,
                            0
                    );

            // -------------------------------------------------
            // GAP SEVERITY
            // -------------------------------------------------

            String gapSeverity =
                    getGapSeverity(gap);

            // =================================================
            // SAVE ASSESSMENT GAP RESULT
            // =================================================

            AssessmentGapResult gapResult =
                    new AssessmentGapResult();

            gapResult.setAttempt(attempt);

            gapResult.setSkillName(
                    skillName
            );

            gapResult.setActualScore(
                    actualScore
            );

            gapResult.setRequiredScore(
                    requiredScore
            );

            gapResult.setGap(
                    gap
            );

            gapResult.setGapSeverity(
                    gapSeverity
            );

            assessmentGapResultRepository.save(
                    gapResult
            );

            // =================================================
            // ADD TO RESPONSE
            // =================================================

            skillResults.add(
                    new AssessmentSkillResultResponse(
                            skillName,
                            actualScore,
                            requiredScore,
                            gap,
                            gapSeverity
                    )
            );
        }

        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return new AssessmentResultResponse(
                attempt.getId(),
                assessment.getId(),
                assessment.getTitle(),
                overallScore,
                performanceLevel,
                correctAnswers,
                questions.size(),
                skillResults
        );
    }

    // =========================================================
    // GET ASSESSMENT GAP RESULTS BY ATTEMPT ID
    // =========================================================

    public List<AssessmentGapResult> getAssessmentGapResults(
            Long attemptId) {

        AssessmentAttempt attempt =
                assessmentAttemptRepository
                        .findById(attemptId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment attempt not found with id: "
                                                + attemptId
                                ));

        return assessmentGapResultRepository
                .findByAttempt(attempt);
    }

    // =========================================================
    // PERFORMANCE LEVEL
    // =========================================================

    private String getPerformanceLevel(
            double score) {

        if (score >= 90) {
            return "Expert";
        }

        if (score >= 75) {
            return "Advanced";
        }

        if (score >= 60) {
            return "Competent";
        }

        if (score >= 40) {
            return "Intermediate";
        }

        return "Beginner";
    }

    // =========================================================
    // GAP SEVERITY
    // =========================================================

    private String getGapSeverity(
            int gap) {

        if (gap <= 0) {
            return "NO GAP";
        }

        if (gap <= 10) {
            return "LOW";
        }

        if (gap <= 25) {
            return "MEDIUM";
        }

        if (gap <= 40) {
            return "HIGH";
        }

        return "CRITICAL";
    }
}