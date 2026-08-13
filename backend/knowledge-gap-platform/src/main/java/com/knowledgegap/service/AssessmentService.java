package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AssessmentAnswerRepository assessmentAnswerRepository;
    private final AssessmentGapResultRepository assessmentGapResultRepository;

    private final EmployeeService employeeService;

    // ⭐ IMPORTANT
    // This updates EmployeeSkill after assessment
    private final EmployeeSkillService employeeSkillService;


    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentAnswerRepository assessmentAnswerRepository,
            AssessmentGapResultRepository assessmentGapResultRepository,
            EmployeeService employeeService,
            EmployeeSkillService employeeSkillService) {

        this.assessmentRepository = assessmentRepository;
        this.assessmentQuestionRepository = assessmentQuestionRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.assessmentAnswerRepository = assessmentAnswerRepository;
        this.assessmentGapResultRepository = assessmentGapResultRepository;

        this.employeeService = employeeService;

        // ⭐ IMPORTANT
        this.employeeSkillService = employeeSkillService;
    }


    // =========================================================
    // GET ACTIVE ASSESSMENTS
    // =========================================================

    public List<Assessment> getActiveAssessments() {

        return assessmentRepository.findByActiveTrue();
    }


    // =========================================================
    // GET ASSESSMENT BY ID
    // =========================================================

    public Assessment getAssessmentById(Long id) {

        return assessmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assessment not found with id: " + id
                        )
                );
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

        // -----------------------------------------------------
        // VALIDATE REQUEST
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // GET ASSESSMENT
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // GET EMPLOYEE
        // -----------------------------------------------------

        Employee employee =
                employeeService
                        .getEmployeeByIdentifier(
                                employeeIdentifier
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );


        // -----------------------------------------------------
        // GET QUESTIONS
        // -----------------------------------------------------

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository
                        .findByAssessment(
                                assessment
                        );


        if (questions.isEmpty()) {

            throw new IllegalStateException(
                    "No questions found for this assessment."
            );
        }


        // =====================================================
        // CREATE ATTEMPT
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
        // CREATE ANSWER MAP
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
        // MARK CALCULATION
        // =====================================================

        Map<String, Integer> skillTotalMarks =
                new LinkedHashMap<>();


        Map<String, Integer> skillCorrectMarks =
                new LinkedHashMap<>();


        int totalMarks = 0;

        int obtainedMarks = 0;

        int correctAnswers = 0;


        // =====================================================
        // PROCESS EVERY QUESTION
        // =====================================================

        for (
                AssessmentQuestion question :
                questions
        ) {

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
                    selectedAnswer
                            .trim()
                            .equalsIgnoreCase(
                                    correctAnswer.trim()
                            );


            // -------------------------------------------------
            // OVERALL SCORE
            // -------------------------------------------------

            if (correct) {

                obtainedMarks += marks;

                correctAnswers++;
            }


            // -------------------------------------------------
            // GET SKILL NAME
            // -------------------------------------------------

            String skillName =
                    question.getSkillName();


            if (
                    skillName == null ||
                    skillName.isBlank()
            ) {

                skillName = "Other";
            }


            skillName =
                    skillName.trim();


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

            answer.setCorrect(
                    correct
            );


            assessmentAnswerRepository.save(
                    answer
            );
        }


        // =====================================================
        // CALCULATE OVERALL SCORE
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


        // =====================================================
        // UPDATE ATTEMPT
        // =====================================================

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
        // SKILL RESULTS
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
            // CALCULATE SKILL SCORE
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
            // CALCULATE GAP
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
                    getGapSeverity(
                            gap
                    );


            // =================================================
            // ⭐⭐ MOST IMPORTANT PART ⭐⭐
            // =================================================
            //
            // Update EmployeeSkill table using assessment score.
            //
            // Example:
            //
            // Java = 100
            //       ↓
            // EmployeeSkill.currentLevel = 5
            //
            // SQL = 80
            //      ↓
            // EmployeeSkill.currentLevel = 4
            //
            // DSA = 60
            //      ↓
            // EmployeeSkill.currentLevel = 3
            //
            // This is what makes Skill Inventory change.
            // =================================================

            if (!skillName.equalsIgnoreCase("Other")) {

                try {

                    employeeSkillService
                            .updateSkillFromAssessment(
                                    employee,
                                    skillName,
                                    actualScore
                            );

                } catch (RuntimeException e) {

                    /*
                     * Do not stop the entire assessment if
                     * a skill does not exist in the Skill table.
                     *
                     * Example:
                     * Question has "Java"
                     * but Skill table does not contain "Java".
                     */

                    System.out.println(
                            "Unable to update EmployeeSkill for: "
                                    + skillName
                                    + " - "
                                    + e.getMessage()
                    );
                }
            }


            // =================================================
            // SAVE GAP RESULT
            // =================================================

            AssessmentGapResult gapResult =
                    new AssessmentGapResult();


            gapResult.setAttempt(
                    attempt
            );


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
            // ADD RESPONSE
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
    // GET GAP RESULTS
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
                                )
                        );


        return assessmentGapResultRepository
                .findByAttempt(
                        attempt
                );
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