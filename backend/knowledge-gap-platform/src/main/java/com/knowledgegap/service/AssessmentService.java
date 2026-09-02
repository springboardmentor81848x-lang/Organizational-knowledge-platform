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
import com.knowledgegap.entity.AssessmentType;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;

import com.knowledgegap.repository.AssessmentAnswerRepository;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentGapResultRepository;
import com.knowledgegap.repository.AssessmentQuestionRepository;
import com.knowledgegap.repository.AssessmentRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;

    private final AssessmentQuestionRepository assessmentQuestionRepository;

    private final AssessmentAttemptRepository assessmentAttemptRepository;

    private final AssessmentAnswerRepository assessmentAnswerRepository;

    private final AssessmentGapResultRepository assessmentGapResultRepository;

    private final EmployeeService employeeService;

    private final EmployeeSkillService employeeSkillService;

    private final EmployeeSkillRepository employeeSkillRepository;

    private final SkillRepository skillRepository;

    private final KnowledgeGapService knowledgeGapService;

    // =========================================================
    // HR NOTIFICATION SERVICE
    // =========================================================

    private final NotificationService notificationService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentAnswerRepository assessmentAnswerRepository,
            AssessmentGapResultRepository assessmentGapResultRepository,
            EmployeeService employeeService,
            EmployeeSkillService employeeSkillService,
            EmployeeSkillRepository employeeSkillRepository,
            SkillRepository skillRepository,
            KnowledgeGapService knowledgeGapService,
            NotificationService notificationService) {

        this.assessmentRepository =
                assessmentRepository;

        this.assessmentQuestionRepository =
                assessmentQuestionRepository;

        this.assessmentAttemptRepository =
                assessmentAttemptRepository;

        this.assessmentAnswerRepository =
                assessmentAnswerRepository;

        this.assessmentGapResultRepository =
                assessmentGapResultRepository;

        this.employeeService =
                employeeService;

        this.employeeSkillService =
                employeeSkillService;

        this.employeeSkillRepository =
                employeeSkillRepository;

        this.skillRepository =
                skillRepository;

        this.knowledgeGapService =
                knowledgeGapService;

        this.notificationService =
                notificationService;
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

        return assessmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assessment not found with id: "
                                        + id
                        )
                );
    }

    // =========================================================
    // GET ASSESSMENT BY TARGET ROLE
    // =========================================================

    public Assessment getAssessmentByTargetRole(
            Long roleId) {

        return assessmentRepository
                .findByAssessmentRoleIdAndActiveTrue(
                        roleId
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "No active assessment found for role id: "
                                        + roleId
                        )
                );
    }

    // =========================================================
    // GET ASSESSMENT BY ROLE ID
    // =========================================================

    public Assessment getAssessmentByRoleId(
            Long roleId) {

        return getAssessmentByTargetRole(roleId);
    }

    // =========================================================
    // GET QUESTIONS BY ASSESSMENT
    // =========================================================

    public List<AssessmentQuestion> getQuestionsByAssessment(
            Long assessmentId) {

        return assessmentQuestionRepository
                .findByAssessmentId(
                        assessmentId
                );
    }

    // =========================================================
    // SUBMIT ASSESSMENT
    // =========================================================
    //
    // Handles:
    //
    // SELF
    // PEER
    // MANAGER
    //
    // Also handles:
    //
    // 1. Assessment attempt
    // 2. Evaluator
    // 3. Skill score
    // 4. Previous skill level
    // 5. Assessed skill level
    // 6. Improvement
    // 7. Employee skill update
    // 8. Gap calculation
    // 9. Automatic knowledge gap recalculation
    // 10. HR assessment completed notification
    //
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
        // VALIDATE ASSESSMENT TYPE
        // -----------------------------------------------------

        AssessmentType assessmentType =
                request.getAssessmentType();

        if (assessmentType == null) {

            throw new IllegalArgumentException(
                    "Assessment type is required. "
                            + "Use SELF, PEER or MANAGER."
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
        // GET EMPLOYEE BEING ASSESSED
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

        // =====================================================
        // GET EVALUATOR
        // =====================================================

        Employee evaluator = null;

        if (assessmentType ==
                AssessmentType.SELF) {

            /*
             * In self assessment, the employee is
             * the evaluator.
             */
            evaluator = employee;

        } else {

            /*
             * PEER and MANAGER assessments require
             * another employee to be the evaluator.
             */

            if (request.getEvaluatorId() == null ||
                    request.getEvaluatorId().isBlank()) {

                throw new IllegalArgumentException(
                        "Evaluator ID is required for "
                                + assessmentType
                                + " assessment."
                );
            }

            evaluator =
                    employeeService
                            .getEmployeeByIdentifier(
                                    request.getEvaluatorId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Evaluator not found: "
                                                    + request.getEvaluatorId()
                                    )
                            );

            /*
             * An employee cannot evaluate themselves
             * as PEER or MANAGER.
             */
            if (evaluator.getId()
                    .equals(employee.getId())) {

                throw new IllegalArgumentException(
                        "Employee cannot be their own "
                                + assessmentType
                                + " evaluator."
                );
            }
        }

        // -----------------------------------------------------
        // GET QUESTIONS
        // -----------------------------------------------------

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository
                        .findByAssessmentId(
                                assessment.getId()
                        );

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

        attempt.setAssessmentType(
                assessmentType
        );

        attempt.setEvaluator(
                evaluator
        );

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
        // CREATE SUBMITTED ANSWER MAP
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

            // -------------------------------------------------
            // SELECTED ANSWER
            // -------------------------------------------------

            String selectedAnswer =
                    submittedAnswers.get(
                            question.getId()
                    );

            // -------------------------------------------------
            // CORRECT ANSWER
            // -------------------------------------------------

            String correctAnswer =
                    getCorrectAnswerText(
                            question
                    );

            // -------------------------------------------------
            // CHECK ANSWER
            // -------------------------------------------------

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
            // SKILL NAME
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

            // =================================================
            // SAVE ANSWER
            // =================================================

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

        // =====================================================
        // PERFORMANCE LEVEL
        // =====================================================

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

        // =====================================================
        // PROCESS EACH SKILL
        // =====================================================

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
            // SKILL SCORE
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
            // PERCENTAGE GAP
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
            // FIND SKILL
            // =================================================

            Optional<Skill> skillOptional =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    skillName
                            );

            // =================================================
            // GET PREVIOUS LEVEL
            // =================================================

            int previousLevel = 1;

            if (skillOptional.isPresent()) {

                Skill skill =
                        skillOptional.get();

                Optional<EmployeeSkill>
                        existingEmployeeSkill =
                        employeeSkillRepository
                                .findByEmployeeAndSkill(
                                        employee,
                                        skill
                                );

                if (existingEmployeeSkill.isPresent() &&
                        existingEmployeeSkill.get()
                                .getCurrentLevel() != null) {

                    previousLevel =
                            normalizeLevel(
                                    existingEmployeeSkill
                                            .get()
                                            .getCurrentLevel()
                            );
                }
            }

            // =================================================
            // CONVERT SCORE TO EXISTING 1-5 LEVEL
            // =================================================

            int assessedLevel =
                    convertScoreToLevel(
                            actualScore
                    );

            // =================================================
            // CALCULATE IMPROVEMENT
            // =================================================

            int improvement =
                    assessedLevel - previousLevel;

            // =================================================
            // SAVE ASSESSMENT GAP RESULT
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

            // -------------------------------------------------
            // MODULE 5 HISTORICAL COMPARISON
            // -------------------------------------------------

            gapResult.setPreviousLevel(
                    previousLevel
            );

            gapResult.setAssessedLevel(
                    assessedLevel
            );

            gapResult.setImprovement(
                    improvement
            );

            assessmentGapResultRepository.save(
                    gapResult
            );

            // =================================================
            // ADD RESULT
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
        // UPDATE EMPLOYEE SKILL INVENTORY
        // =====================================================

        employeeSkillService
                .replaceSkillsFromAssessment(
                        employee,
                        skillResults
                );

        // =====================================================
        // AUTOMATIC KNOWLEDGE GAP RECALCULATION
        // =====================================================

        try {

            knowledgeGapService
                    .detectAndSaveGaps(
                            employee
                    );

            System.out.println(
                    "Knowledge gaps recalculated automatically "
                            + "after assessment."
            );

        } catch (Exception e) {

            System.out.println(
                    "WARNING: Knowledge gap recalculation failed: "
                            + e.getMessage()
            );
        }

        // =====================================================
        // NOTIFY HR - ASSESSMENT COMPLETED
        // =====================================================

        String employeeName =
                (employee.getFirstName() != null
                        ? employee.getFirstName()
                        : "")
                + " "
                + (employee.getLastName() != null
                        ? employee.getLastName()
                        : "");

        employeeName =
                employeeName.trim();

        if (employeeName.isEmpty()) {
            employeeName = "An employee";
        }

        String employeeId =
                employee.getEmployeeId();

        String assessmentTypeName =
                assessmentType.name();

        String notificationMessage;

        if (employeeId != null &&
                !employeeId.trim().isEmpty()) {

            notificationMessage =
                    employeeName
                    + " ("
                    + employeeId
                    + ") completed a "
                    + assessmentTypeName
                    + " assessment."
                    + " Overall score: "
                    + overallScore
                    + "%.";

        } else {

            notificationMessage =
                    employeeName
                    + " completed a "
                    + assessmentTypeName
                    + " assessment."
                    + " Overall score: "
                    + overallScore
                    + "%.";
        }

        notificationService.notifyHR(
                "ASSESSMENT_COMPLETED",
                notificationMessage
        );

        // =====================================================
        // RETURN RESULT
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
    // GET ASSESSMENT GAP RESULTS
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
                .findByAttempt(attempt);
    }

    // =========================================================
    // GET CORRECT ANSWER TEXT
    // =========================================================

    private String getCorrectAnswerText(
            AssessmentQuestion question) {

        String answer =
                question.getCorrectAnswer();

        if (
                answer == null ||
                answer.isBlank()
        ) {

            return null;
        }

        answer =
                answer.trim();

        switch (answer.toUpperCase()) {

            case "A":
                return question.getOptionA();

            case "B":
                return question.getOptionB();

            case "C":
                return question.getOptionC();

            case "D":
                return question.getOptionD();

            default:
                return answer;
        }
    }

    // =========================================================
    // CONVERT SCORE TO EXISTING 1-5 LEVEL
    // =========================================================

    private int convertScoreToLevel(
            int score) {

        score =
                Math.max(
                        0,
                        Math.min(
                                100,
                                score
                        )
                );

        if (score >= 90) {
            return 5;
        }

        if (score >= 75) {
            return 4;
        }

        if (score >= 60) {
            return 3;
        }

        if (score >= 40) {
            return 2;
        }

        return 1;
    }

    // =========================================================
    // NORMALIZE LEVEL
    // =========================================================

    private int normalizeLevel(
            Integer level) {

        if (level == null) {
            return 1;
        }

        return Math.max(
                1,
                Math.min(
                        5,
                        level
                )
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