package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.dto.AssessmentAnswerRequest;
import com.team7.knowledge_gap_platform.dto.AssessmentComparisonResponse;
import com.team7.knowledge_gap_platform.dto.AssessmentResultResponse;
import com.team7.knowledge_gap_platform.dto.AssessmentSubmitRequest;
import com.team7.knowledge_gap_platform.entity.Assessment;
import com.team7.knowledge_gap_platform.entity.AssessmentQuestion;
import com.team7.knowledge_gap_platform.entity.AssessmentResult;
import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.repository.AssessmentQuestionRepository;
import com.team7.knowledge_gap_platform.repository.AssessmentRepository;
import com.team7.knowledge_gap_platform.repository.AssessmentResultRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    // NEW
    private final SkillGapService skillGapService;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            AssessmentResultRepository assessmentResultRepository,
            EmployeeSkillRepository employeeSkillRepository,
            SkillGapService skillGapService) {

        this.assessmentRepository = assessmentRepository;
        this.assessmentQuestionRepository = assessmentQuestionRepository;
        this.assessmentResultRepository = assessmentResultRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillGapService = skillGapService;
    }

    // =========================================================
    // CREATE ASSESSMENT
    // =========================================================

    public Assessment createAssessment(
            Assessment assessment) {

        return assessmentRepository
                .save(assessment);
    }

    // =========================================================
    // GET ASSESSMENT BY SKILL
    // =========================================================

    public Assessment getAssessmentBySkillId(
            Long skillId) {

        return assessmentRepository
                .findBySkillId(skillId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Assessment not found for skill: "
                                        + skillId));
    }

    // =========================================================
    // GET ASSESSMENT BY SKILL + TYPE
    // =========================================================

    public Assessment getAssessmentBySkillIdAndType(
            Long skillId,
            String assessmentType) {

        return assessmentRepository
                .findBySkillIdAndAssessmentType(
                        skillId,
                        assessmentType.toUpperCase())
                .orElseGet(() ->
                        assessmentRepository
                                .findBySkillId(skillId)
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Assessment not found for skill "
                                                        + skillId)));
    }

    // =========================================================
    // ADD QUESTION
    // =========================================================

    public AssessmentQuestion addQuestion(
            AssessmentQuestion question) {

        return assessmentQuestionRepository
                .save(question);
    }

    // =========================================================
    // GET QUESTIONS
    // =========================================================

    public List<AssessmentQuestion> getQuestions(
            Long assessmentId) {

        return assessmentQuestionRepository
                .findByAssessmentId(
                        assessmentId);
    }

    // =========================================================
    // SUBMIT ASSESSMENT
    // =========================================================

    public AssessmentResultResponse submitAssessment(
            Long assessmentId,
            AssessmentSubmitRequest request) {

        Assessment assessment =
                assessmentRepository
                        .findById(assessmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment not found"));

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository
                        .findByAssessmentId(
                                assessmentId);

        if (questions.isEmpty()) {
            throw new RuntimeException(
                    "No questions found for assessment");
        }

        int correctAnswers = 0;

        for (AssessmentAnswerRequest answer
                : request.getAnswers()) {

            AssessmentQuestion question =
                    assessmentQuestionRepository
                            .findById(
                                    answer.getQuestionId())
                            .orElse(null);

            if (question == null) {
                continue;
            }

            if (!question.getAssessmentId()
                    .equals(assessmentId)) {

                continue;
            }

            if (question.getCorrectAnswer() != null
                    && answer.getSelectedAnswer() != null
                    && question.getCorrectAnswer()
                            .equalsIgnoreCase(
                                    answer.getSelectedAnswer())) {

                correctAnswers++;
            }
        }

        int totalQuestions =
                questions.size();

        double scorePercentage =
                ((double) correctAnswers
                        / totalQuestions)
                        * 100.0;

        String proficiencyLevel =
                getProficiencyLevel(
                        scorePercentage);

        System.out.println(
                "DEBUG: Assessment Complete. "
                        + correctAnswers
                        + "/"
                        + totalQuestions
                        + " = "
                        + scorePercentage
                        + "%");

        // =====================================================
        // SAVE ASSESSMENT RESULT
        // =====================================================

        AssessmentResult result =
                new AssessmentResult();

        result.setAssessmentId(
                assessmentId);

        result.setEmployeeId(
                request.getEmployeeId());

        result.setSkillId(
                assessment.getSkillId());

        result.setAssessmentType(
                assessment.getAssessmentType());

        result.setCorrectAnswers(
                correctAnswers);

        result.setTotalQuestions(
                totalQuestions);

        result.setScorePercentage(
                scorePercentage);

        result.setProficiencyLevel(
                proficiencyLevel);

        result.setCompletedAt(
                LocalDateTime.now());

        assessmentResultRepository
                .save(result);

        System.out.println(
                "DEBUG: Saved assessment type = "
                        + assessment.getAssessmentType());

        // =====================================================
        // UPDATE COMBINED EMPLOYEE PROFICIENCY
        // =====================================================

        updateEmployeeSkillFromCombinedAssessments(
                request.getEmployeeId(),
                assessment.getSkillId());

        // =====================================================
        // NEW: AUTOMATIC SKILL GAP RECALCULATION
        // =====================================================

        try {

            skillGapService
                    .analyzeAndSaveGapsByEmployee(
                            request.getEmployeeId());

            System.out.println(
                    "DEBUG: Skill gaps recalculated automatically "
                            + "for employee "
                            + request.getEmployeeId());

        } catch (RuntimeException e) {

            /*
             * Do not fail assessment submission if employee
             * currently has no job role / competency setup.
             *
             * Assessment result and proficiency update remain saved.
             */

            System.out.println(
                    "DEBUG: Skill gap recalculation skipped: "
                            + e.getMessage());
        }

        // =====================================================
        // BUILD RESPONSE
        // =====================================================

        AssessmentResultResponse response =
                new AssessmentResultResponse();

        response.setAssessmentId(
                assessmentId);

        response.setEmployeeId(
                request.getEmployeeId());

        response.setSkillId(
                assessment.getSkillId());

        response.setAssessmentType(
                assessment.getAssessmentType());

        response.setCorrectAnswers(
                correctAnswers);

        response.setTotalQuestions(
                totalQuestions);

        response.setScorePercentage(
                scorePercentage);

        response.setProficiencyLevel(
                proficiencyLevel);

        return response;
    }

    // =========================================================
    // HISTORICAL RESULTS
    // =========================================================

    public List<AssessmentResult> getHistoricalResults(
            Long employeeId,
            Long skillId) {

        return assessmentResultRepository
                .findByEmployeeIdAndSkillId(
                        employeeId,
                        skillId);
    }

    // =========================================================
    // SELF + PEER + MANAGER COMPARISON
    // =========================================================

    public AssessmentComparisonResponse getAssessmentComparison(
            Long employeeId,
            Long skillId) {

        Optional<AssessmentResult> selfResult =
                assessmentResultRepository
                        .findTopByEmployeeIdAndSkillIdAndAssessmentTypeOrderByCompletedAtDesc(
                                employeeId,
                                skillId,
                                "SELF");

        Optional<AssessmentResult> peerResult =
                assessmentResultRepository
                        .findTopByEmployeeIdAndSkillIdAndAssessmentTypeOrderByCompletedAtDesc(
                                employeeId,
                                skillId,
                                "PEER");

        Optional<AssessmentResult> managerResult =
                assessmentResultRepository
                        .findTopByEmployeeIdAndSkillIdAndAssessmentTypeOrderByCompletedAtDesc(
                                employeeId,
                                skillId,
                                "MANAGER");

        Double selfScore =
                selfResult
                        .map(
                                AssessmentResult
                                        ::getScorePercentage)
                        .orElse(null);

        Double peerScore =
                peerResult
                        .map(
                                AssessmentResult
                                        ::getScorePercentage)
                        .orElse(null);

        Double managerScore =
                managerResult
                        .map(
                                AssessmentResult
                                        ::getScorePercentage)
                        .orElse(null);

        double totalScore = 0.0;
        int scoreCount = 0;

        if (selfScore != null) {
            totalScore += selfScore;
            scoreCount++;
        }

        if (peerScore != null) {
            totalScore += peerScore;
            scoreCount++;
        }

        if (managerScore != null) {
            totalScore += managerScore;
            scoreCount++;
        }

        double combinedScore =
                scoreCount == 0
                        ? 0.0
                        : totalScore
                        / scoreCount;

        String combinedProficiencyLevel =
                getProficiencyLevel(
                        combinedScore);

        AssessmentComparisonResponse response =
                new AssessmentComparisonResponse();

        response.setEmployeeId(
                employeeId);

        response.setSkillId(
                skillId);

        response.setSelfScore(
                selfScore);

        response.setPeerScore(
                peerScore);

        response.setManagerScore(
                managerScore);

        response.setCombinedScore(
                combinedScore);

        response.setCombinedProficiencyLevel(
                combinedProficiencyLevel);

        return response;
    }

    // =========================================================
    // UPDATE EMPLOYEE SKILL FROM ASSESSMENTS
    // =========================================================

    private void updateEmployeeSkillFromCombinedAssessments(
            Long employeeId,
            Long skillId) {

        Optional<AssessmentResult> selfResult =
                assessmentResultRepository
                        .findTopByEmployeeIdAndSkillIdAndAssessmentTypeOrderByCompletedAtDesc(
                                employeeId,
                                skillId,
                                "SELF");

        Optional<AssessmentResult> peerResult =
                assessmentResultRepository
                        .findTopByEmployeeIdAndSkillIdAndAssessmentTypeOrderByCompletedAtDesc(
                                employeeId,
                                skillId,
                                "PEER");

        Optional<AssessmentResult> managerResult =
                assessmentResultRepository
                        .findTopByEmployeeIdAndSkillIdAndAssessmentTypeOrderByCompletedAtDesc(
                                employeeId,
                                skillId,
                                "MANAGER");

        double totalScore = 0.0;
        int count = 0;

        if (selfResult.isPresent()) {

            totalScore +=
                    selfResult
                            .get()
                            .getScorePercentage();

            count++;
        }

        if (peerResult.isPresent()) {

            totalScore +=
                    peerResult
                            .get()
                            .getScorePercentage();

            count++;
        }

        if (managerResult.isPresent()) {

            totalScore +=
                    managerResult
                            .get()
                            .getScorePercentage();

            count++;
        }

        if (count == 0) {
            return;
        }

        double combinedScore =
                totalScore
                        / (double) count;

        String combinedProficiencyLevel =
                getProficiencyLevel(
                        combinedScore);

        System.out.println(
                "DEBUG: Combined Score = "
                        + combinedScore);

        System.out.println(
                "DEBUG: Combined Level = "
                        + combinedProficiencyLevel);

        updateEmployeeSkill(
                employeeId,
                skillId,
                combinedProficiencyLevel,
                combinedScore);
    }

    // =========================================================
    // SAVE / UPDATE EMPLOYEE SKILL
    // =========================================================

    private void updateEmployeeSkill(
            Long employeeId,
            Long skillId,
            String proficiencyLevel,
            Double proficiencyScore) {

        EmployeeSkill employeeSkill =
                employeeSkillRepository
                        .findByEmployeeIdAndSkillId(
                                employeeId,
                                skillId)
                        .orElseGet(() -> {

                            EmployeeSkill newSkill =
                                    new EmployeeSkill();

                            newSkill.setEmployeeId(
                                    employeeId);

                            newSkill.setSkillId(
                                    skillId);

                            return newSkill;
                        });

        employeeSkill.setProficiencyLevel(
                proficiencyLevel);

        employeeSkill.setProficiencyScore(
                proficiencyScore);

        employeeSkillRepository
                .save(employeeSkill);
    }

    // =========================================================
    // SCORE -> PROFICIENCY LEVEL
    // =========================================================

    private String getProficiencyLevel(
            double score) {

        if (score >= 90) {
            return "Expert";
        }

        if (score >= 70) {
            return "Advanced";
        }

        if (score >= 40) {
            return "Intermediate";
        }

        if (score >= 10) {
            return "Beginner";
        }

        return "Unaware";
    }
}