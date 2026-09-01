package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.ReassessmentAnswerRequest;
import com.knowledgegap.dto.ReassessmentRequest;
import com.knowledgegap.dto.ReassessmentResponse;
import com.knowledgegap.dto.ReassessmentSkillResultResponse;

import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentAnswer;
import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.AssessmentQuestion;
import com.knowledgegap.entity.AssessmentType;
import com.knowledgegap.entity.Competency;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;

import com.knowledgegap.repository.AssessmentAnswerRepository;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentGapResultRepository;
import com.knowledgegap.repository.AssessmentQuestionRepository;
import com.knowledgegap.repository.AssessmentRepository;
import com.knowledgegap.repository.CompetencyRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
public class ReassessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AssessmentAnswerRepository assessmentAnswerRepository;
    private final AssessmentGapResultRepository assessmentGapResultRepository;
    private final EmployeeService employeeService;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final CompetencyRepository competencyRepository;
    private final KnowledgeGapService knowledgeGapService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ReassessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentAnswerRepository assessmentAnswerRepository,
            AssessmentGapResultRepository assessmentGapResultRepository,
            EmployeeService employeeService,
            EmployeeSkillRepository employeeSkillRepository,
            SkillRepository skillRepository,
            CompetencyRepository competencyRepository,
            KnowledgeGapService knowledgeGapService) {

        this.assessmentRepository = assessmentRepository;

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

        this.employeeSkillRepository =
                employeeSkillRepository;

        this.skillRepository =
                skillRepository;

        this.competencyRepository =
                competencyRepository;

        this.knowledgeGapService =
                knowledgeGapService;
    }


    // =========================================================
    // GET REASSESSMENT QUESTIONS
    // =========================================================

    public List<AssessmentQuestion> getReassessmentQuestions(
            Long assessmentId) {

        if (assessmentId == null) {

            throw new IllegalArgumentException(
                    "Assessment ID is required."
            );
        }

        Assessment assessment =
                assessmentRepository
                        .findById(assessmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found with id: "
                                                + assessmentId
                                )
                        );

        if (!Boolean.TRUE.equals(
                assessment.getActive())) {

            throw new IllegalStateException(
                    "This assessment is not active."
            );
        }

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository
                        .findByAssessmentId(
                                assessmentId
                        );

        if (questions == null ||
                questions.isEmpty()) {

            throw new IllegalStateException(
                    "No questions found for this assessment."
            );
        }

        return questions;
    }


    // =========================================================
    // GET LATEST SAVED REASSESSMENT RESULT
    // =========================================================

    @Transactional(readOnly = true)
    public Optional<ReassessmentResponse>
    getLatestReassessmentResult(
            Long assessmentId,
            String employeeIdentifier) {

        if (assessmentId == null) {

            throw new IllegalArgumentException(
                    "Assessment ID is required."
            );
        }

        if (employeeIdentifier == null ||
                employeeIdentifier.isBlank()) {

            throw new IllegalArgumentException(
                    "Employee identifier is required."
            );
        }

        Assessment assessment =
                assessmentRepository
                        .findById(assessmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found with id: "
                                                + assessmentId
                                )
                        );

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

        Optional<AssessmentAttempt> attemptOptional =
                assessmentAttemptRepository
                        .findFirstByEmployeeAndAssessmentAndAssessmentTypeOrderByIdDesc(
                                employee,
                                assessment,
                                AssessmentType.REASSESSMENT
                        );

        if (attemptOptional.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(
                buildReassessmentResponse(
                        attemptOptional.get(),
                        employee
                )
        );
    }

    @Transactional(readOnly = true)
    public Optional<ReassessmentResponse>
    getLatestReassessmentResultByEmployee(
            String employeeIdentifier) {

        if (employeeIdentifier == null ||
                employeeIdentifier.isBlank()) {

            throw new IllegalArgumentException(
                    "Employee identifier is required."
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
                                )
                        );

        List<AssessmentAttempt> attempts =
                assessmentAttemptRepository
                        .findByEmployeeOrderByCompletedAtAsc(employee);

        if (attempts == null || attempts.isEmpty()) {
            return Optional.empty();
        }

        Optional<AssessmentAttempt> latestAttempt =
                attempts.stream()
                        .filter(attempt ->
                                attempt.getAssessmentType() ==
                                        AssessmentType.REASSESSMENT)
                        .sorted(Comparator.comparing(
                                AssessmentAttempt::getCompletedAt,
                                Comparator.nullsLast(LocalDateTime::compareTo)
                        ).reversed())
                        .findFirst();

        if (latestAttempt.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(
                buildReassessmentResponse(
                        latestAttempt.get(),
                        employee
                )
        );
    }

    private ReassessmentResponse buildReassessmentResponse(
            AssessmentAttempt attempt,
            Employee employee) {

        Assessment assessment = attempt.getAssessment();

        List<AssessmentAnswer> answers =
                assessmentAnswerRepository
                        .findByAttempt(attempt);

        int correctAnswers = 0;
        if (answers != null) {
            for (AssessmentAnswer answer : answers) {
                if (Boolean.TRUE.equals(answer.getCorrect())) {
                    correctAnswers++;
                }
            }
        }

        int totalQuestions =
                answers != null
                        ? answers.size()
                        : assessmentQuestionRepository
                                .findByAssessmentId(
                                        assessment.getId()
                                )
                                .size();

        List<AssessmentGapResult> gapResults =
                assessmentGapResultRepository
                        .findByAttempt(attempt);

        List<ReassessmentSkillResultResponse> skillResults =
                new ArrayList<>();

        if (gapResults != null) {
            for (AssessmentGapResult gapResult : gapResults) {
                int previousLevel =
                        normalizeLevel(
                                gapResult.getPreviousLevel()
                        );

                int currentLevel =
                        normalizeLevel(
                                gapResult.getAssessedLevel()
                        );

                int requiredLevel =
                        getRequiredLevelFromCompetency(
                                employee,
                                gapResult.getSkillName(),
                                currentLevel
                        );

                String previousLevelName =
                        getLevelName(previousLevel);

                String currentLevelName =
                        getLevelName(currentLevel);

                String requiredLevelName =
                        getLevelName(requiredLevel);

                int remainingGap =
                        Math.max(
                                requiredLevel - currentLevel,
                                0
                        );

                String gapSeverity =
                        getGapSeverity(remainingGap);

                skillResults.add(
                        new ReassessmentSkillResultResponse(
                                gapResult.getSkillName(),
                                previousLevel,
                                previousLevelName,
                                currentLevel,
                                currentLevelName,
                                currentLevel - previousLevel,
                                requiredLevel,
                                requiredLevelName,
                                remainingGap,
                                gapSeverity,
                                gapResult.getActualScore()
                        )
                );
            }
        }

        return new ReassessmentResponse(
                attempt.getId(),
                assessment.getId(),
                assessment.getTitle(),
                employee.getEmployeeId(),
                attempt.getOverallScore(),
                attempt.getPerformanceLevel(),
                correctAnswers,
                totalQuestions,
                skillResults
        );
    }


    // =========================================================
    // SUBMIT REASSESSMENT
    // =========================================================

    @Transactional
    public ReassessmentResponse submitReassessment(
            ReassessmentRequest request) {

        // =====================================================
        // 1. VALIDATE REQUEST
        // =====================================================

        if (request == null) {

            throw new IllegalArgumentException(
                    "Reassessment request cannot be null."
            );
        }

        if (request.getAssessmentId() == null) {

            throw new IllegalArgumentException(
                    "Assessment ID is required."
            );
        }

        if (request.getEmployeeIdentifier() == null ||
                request.getEmployeeIdentifier().isBlank()) {

            throw new IllegalArgumentException(
                    "Employee identifier is required."
            );
        }

        if (request.getAnswers() == null ||
                request.getAnswers().isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one answer is required."
            );
        }


        // =====================================================
        // 2. GET ASSESSMENT
        // =====================================================

        Assessment assessment =
                assessmentRepository
                        .findById(
                                request.getAssessmentId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found with id: "
                                                + request.getAssessmentId()
                                )
                        );


        if (!Boolean.TRUE.equals(
                assessment.getActive())) {

            throw new IllegalStateException(
                    "This assessment is not active."
            );
        }


        // =====================================================
        // 3. GET EMPLOYEE
        // =====================================================

        Employee employee =
                employeeService
                        .getEmployeeByIdentifier(
                                request.getEmployeeIdentifier()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + request.getEmployeeIdentifier()
                                )
                        );


        // =====================================================
        // 4. GET QUESTIONS
        // =====================================================

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository
                        .findByAssessmentId(
                                assessment.getId()
                        );


        if (questions == null ||
                questions.isEmpty()) {

            throw new IllegalStateException(
                    "No questions found for this assessment."
            );
        }


        // =====================================================
        // 5. CREATE ANSWER MAP
        // =====================================================

        Map<Long, String> submittedAnswers =
                new HashMap<>();


        for (
                ReassessmentAnswerRequest answerRequest :
                request.getAnswers()
        ) {

            if (answerRequest == null) {
                continue;
            }

            Long questionId =
                    answerRequest.getQuestionId();

            if (questionId == null) {
                continue;
            }

            submittedAnswers.put(
                    questionId,
                    answerRequest.getSelectedAnswer()
            );
        }


        // =====================================================
        // 6. VALIDATE QUESTIONS
        // =====================================================

        for (
                AssessmentQuestion question :
                questions
        ) {

            if (!submittedAnswers.containsKey(
                    question.getId()
            )) {

                throw new IllegalArgumentException(
                        "Please answer all questions before submitting."
                );
            }
        }


        // =====================================================
        // 7. CREATE ATTEMPT
        // =====================================================

        AssessmentAttempt attempt =
                new AssessmentAttempt();

        attempt.setEmployee(employee);

        attempt.setAssessment(assessment);

        attempt.setAssessmentType(
                AssessmentType.REASSESSMENT
        );

        attempt.setEvaluator(employee);

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
        // 8. MARK VARIABLES
        // =====================================================

        int totalMarks = 0;

        int obtainedMarks = 0;

        int correctAnswers = 0;


        Map<String, Integer> skillTotalMarks =
                new LinkedHashMap<>();


        Map<String, Integer> skillCorrectMarks =
                new LinkedHashMap<>();


        // =====================================================
        // 9. PROCESS QUESTIONS
        // =====================================================

        for (
                AssessmentQuestion question :
                questions
        ) {

            int marks =
                    Optional
                            .ofNullable(
                                    question.getMarks()
                            )
                            .orElse(1);


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


            if (correct) {

                obtainedMarks += marks;

                correctAnswers++;
            }


            String skillName =
                    question.getSkillName();


            if (skillName == null ||
                    skillName.isBlank()) {

                skillName = "Other";
            }


            skillName =
                    skillName.trim();


            skillTotalMarks.put(
                    skillName,
                    skillTotalMarks.getOrDefault(
                            skillName,
                            0
                    ) + marks
            );


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

            answer.setCorrect(correct);

            assessmentAnswerRepository.save(answer);
        }


        // =====================================================
        // 10. OVERALL SCORE
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
        // 11. PERFORMANCE LEVEL
        // =====================================================

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

        attempt.setCompletedAt(
                LocalDateTime.now()
        );


        assessmentAttemptRepository.save(
                attempt
        );


        // =====================================================
        // 12. BUILD SKILL RESULTS
        // =====================================================

        List<ReassessmentSkillResultResponse>
                skillResults =
                new ArrayList<>();


        // =====================================================
        // 13. PROCESS EACH SKILL
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


            int actualScore =
                    skillTotal > 0
                            ? (int) Math.round(
                                    ((double) skillCorrect /
                                     skillTotal) * 100
                            )
                            : 0;


            // =================================================
            // FIND SKILL
            // =================================================

            Skill skill =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    skillName
                            )
                            .orElse(null);


            EmployeeSkill employeeSkill =
                    null;


            if (skill != null) {

                employeeSkill =
                        employeeSkillRepository
                                .findByEmployeeAndSkill(
                                        employee,
                                        skill
                                )
                                .orElse(null);
            }


            // =================================================
            // PREVIOUS LEVEL
            // =================================================

            int previousLevel =
                    employeeSkill != null
                            ? normalizeLevel(
                                    employeeSkill.getCurrentLevel()
                            )
                            : 1;


            // =================================================
            // CURRENT LEVEL
            // =================================================

            int currentLevel =
                    convertScoreToLevel(
                            actualScore
                    );


            // =================================================
            // IMPROVEMENT
            // =================================================

            int improvement =
                    currentLevel -
                    previousLevel;


            // =================================================
            // UPDATE EMPLOYEE SKILL
            // =================================================

            if (employeeSkill != null) {

                employeeSkill.setCurrentLevel(
                        currentLevel
                );

                employeeSkillRepository.save(
                        employeeSkill
                );
            }


            // =================================================
            // REQUIRED LEVEL FROM COMPETENCY FRAMEWORK
            // =================================================

            int requiredLevel =
                    getRequiredLevelFromCompetency(
                            employee,
                            skillName,
                            currentLevel
                    );


            // =================================================
            // REQUIRED SCORE
            // =================================================

            int requiredScore =
                    convertLevelToScore(
                            requiredLevel
                    );


            // =================================================
            // REMAINING GAP
            // =================================================

            int remainingGap =
                    Math.max(
                            requiredLevel -
                            currentLevel,
                            0
                    );


            // =================================================
            // GAP SEVERITY
            // =================================================

            String gapSeverity =
                    getGapSeverity(
                            remainingGap
                    );


            String previousLevelName =
                    getLevelName(
                            previousLevel
                    );


            String currentLevelName =
                    getLevelName(
                            currentLevel
                    );


            String requiredLevelName =
                    getLevelName(
                            requiredLevel
                    );


            // =================================================
            // SAVE HISTORICAL RESULT
            // =================================================

            AssessmentGapResult gapResult =
                    new AssessmentGapResult();


            gapResult.setAttempt(attempt);

            gapResult.setSkillName(skillName);

            gapResult.setActualScore(actualScore);

            gapResult.setRequiredScore(requiredScore);

            gapResult.setGap(remainingGap);

            gapResult.setGapSeverity(gapSeverity);

            gapResult.setPreviousLevel(previousLevel);

            gapResult.setAssessedLevel(currentLevel);

            gapResult.setImprovement(improvement);


            assessmentGapResultRepository.save(
                    gapResult
            );


            // =================================================
            // RESPONSE
            // =================================================

            skillResults.add(
                    new ReassessmentSkillResultResponse(
                            skillName,
                            previousLevel,
                            previousLevelName,
                            currentLevel,
                            currentLevelName,
                            improvement,
                            requiredLevel,
                            requiredLevelName,
                            remainingGap,
                            gapSeverity,
                            actualScore
                    )
            );
        }


        // =====================================================
        // 14. AUTOMATIC KNOWLEDGE GAP RECALCULATION
        // =====================================================

        knowledgeGapService
                .detectAndSaveGaps(
                        employee
                );


        // =====================================================
        // 15. RETURN RESULT
        // =====================================================

        return new ReassessmentResponse(
                attempt.getId(),
                assessment.getId(),
                assessment.getTitle(),
                employee.getEmployeeId(),
                overallScore,
                performanceLevel,
                correctAnswers,
                questions.size(),
                skillResults
        );
    }


    // =========================================================
    // GET REQUIRED LEVEL FROM COMPETENCY FRAMEWORK
    // =========================================================

    private int getRequiredLevelFromCompetency(
            Employee employee,
            String skillName,
            int fallbackLevel) {

        if (employee == null ||
                skillName == null ||
                skillName.isBlank()) {

            return fallbackLevel;
        }


        // -----------------------------------------------------
        // GET EMPLOYEE DESIGNATION
        // -----------------------------------------------------

        String designation =
                employee.getDesignation();


        if (designation == null ||
                designation.isBlank()) {

            return fallbackLevel;
        }


        // -----------------------------------------------------
        // GET COMPETENCIES FOR DESIGNATION
        // -----------------------------------------------------

        List<Competency> competencies =
                competencyRepository
                        .findByDesignation(
                                designation
                        );


        if (competencies == null ||
                competencies.isEmpty()) {

            return fallbackLevel;
        }


        // -----------------------------------------------------
        // FIND MATCHING SKILL
        // -----------------------------------------------------

        for (
                Competency competency :
                competencies
        ) {

            if (competency == null ||
                    competency.getSkill() == null) {

                continue;
            }


            String competencySkillName =
                    competency
                            .getSkill()
                            .getSkillName();


            if (competencySkillName == null) {
                continue;
            }


            if (competencySkillName
                    .trim()
                    .equalsIgnoreCase(
                            skillName.trim()
                    )) {

                return normalizeLevel(
                        competency.getRequiredLevel()
                );
            }
        }


        // -----------------------------------------------------
        // NO COMPETENCY FOUND
        // -----------------------------------------------------

        /*
         * Do NOT assume Expert (5).
         *
         * If the competency framework does not define
         * a required level for this skill, retain the
         * current assessed level instead of creating
         * a false knowledge gap.
         */

        return fallbackLevel;
    }


    // =========================================================
    // SCORE → LEVEL
    // =========================================================

    private int convertScoreToLevel(
            int score) {

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
    // LEVEL → SCORE
    // =========================================================

    private int convertLevelToScore(
            int level) {

        switch (level) {

            case 5:
                return 95;

            case 4:
                return 82;

            case 3:
                return 67;

            case 2:
                return 50;

            default:
                return 25;
        }
    }


    // =========================================================
    // LEVEL NAME
    // =========================================================

    private String getLevelName(
            int level) {

        switch (level) {

            case 5:
                return "Expert";

            case 4:
                return "Advanced";

            case 3:
                return "Competent";

            case 2:
                return "Intermediate";

            default:
                return "Beginner";
        }
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

        if (gap == 1) {
            return "LOW";
        }

        if (gap == 2) {
            return "MEDIUM";
        }

        if (gap == 3) {
            return "HIGH";
        }

        return "CRITICAL";
    }
}