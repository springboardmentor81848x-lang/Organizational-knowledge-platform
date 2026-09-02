package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.AssessmentResultResponse;
import com.knowledgegap.dto.AssessmentSkillResultResponse;
import com.knowledgegap.dto.PeerAssessmentSubmitRequest;
import com.knowledgegap.dto.PeerEmployeeResponse;
import com.knowledgegap.dto.PeerReviewResponse;
import com.knowledgegap.dto.PeerSkillRatingRequest;
import com.knowledgegap.dto.PeerSkillReviewResponse;
import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentType;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.PeerAssessmentResult;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.PeerAssessmentResultRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
public class PeerAssessmentService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final PeerAssessmentResultRepository peerAssessmentResultRepository;
    private final NotificationService notificationService;

    public PeerAssessmentService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            SkillRepository skillRepository,
            AssessmentRepository assessmentRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            PeerAssessmentResultRepository peerAssessmentResultRepository,
            NotificationService notificationService) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
        this.assessmentRepository = assessmentRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.peerAssessmentResultRepository = peerAssessmentResultRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // GET COLLEAGUES
    // =========================================================

    public List<PeerEmployeeResponse> getPeerEmployees(
            String evaluatorIdentifier) {

        Employee evaluator =
                employeeRepository
                        .findByEmployeeId(evaluatorIdentifier)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Evaluator not found: "
                                                + evaluatorIdentifier
                                )
                        );

        List<Employee> employees =
                employeeRepository.findAll();

        List<PeerEmployeeResponse> result =
                new ArrayList<>();

        for (Employee employee : employees) {

            // Do not show the logged-in employee
            if (employee.getId().equals(evaluator.getId())) {
                continue;
            }

            // Only employees with a target role
            if (employee.getTargetRoleId() == null) {
                continue;
            }

            result.add(
                    new PeerEmployeeResponse(
                            employee.getEmployeeId(),
                            employee.getFirstName(),
                            employee.getLastName(),
                            employee.getDesignation(),
                            employee.getTargetRoleId()
                    )
            );
        }

        return result;
    }

    // =========================================================
    // GET SKILLS OF EMPLOYEE BEING EVALUATED
    // =========================================================

    public List<EmployeeSkill> getEmployeeSkills(
            String employeeIdentifier) {

        Employee employee =
                employeeRepository
                        .findByEmployeeId(employeeIdentifier)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );

        return employeeSkillRepository
                .findByEmployee(employee);
    }

    // =========================================================
    // SUBMIT PEER ASSESSMENT
    // =========================================================

    @Transactional
    public AssessmentResultResponse submitPeerAssessment(
            String evaluatorIdentifier,
            PeerAssessmentSubmitRequest request) {

        // -----------------------------------------------------
        // VALIDATE REQUEST
        // -----------------------------------------------------

        if (request == null) {
            throw new IllegalArgumentException(
                    "Peer assessment request cannot be null."
            );
        }

        if (request.getEmployeeIdentifier() == null ||
                request.getEmployeeIdentifier().isBlank()) {

            throw new IllegalArgumentException(
                    "Employee being evaluated is required."
            );
        }

        if (request.getRatings() == null ||
                request.getRatings().isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one skill rating is required."
            );
        }

        // -----------------------------------------------------
        // GET EVALUATOR
        // -----------------------------------------------------

        Employee evaluator =
                employeeRepository
                        .findByEmployeeId(evaluatorIdentifier)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Evaluator not found: "
                                                + evaluatorIdentifier
                                )
                        );

        // -----------------------------------------------------
        // GET EMPLOYEE BEING EVALUATED
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmployeeId(
                                request.getEmployeeIdentifier()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + request.getEmployeeIdentifier()
                                )
                        );

        // -----------------------------------------------------
        // PREVENT SELF EVALUATION
        // -----------------------------------------------------

        if (evaluator.getId().equals(employee.getId())) {

            throw new IllegalArgumentException(
                    "Employee cannot evaluate themselves."
            );
        }

        // -----------------------------------------------------
        // GET TARGET ROLE
        // -----------------------------------------------------

        if (employee.getTargetRoleId() == null) {

            throw new IllegalStateException(
                    "Employee does not have a target role."
            );
        }

        // -----------------------------------------------------
        // GET ACTIVE ASSESSMENT FOR TARGET ROLE
        // -----------------------------------------------------

        Assessment assessment =
                assessmentRepository
                        .findByAssessmentRoleIdAndActiveTrue(
                                employee.getTargetRoleId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No active assessment found for target role: "
                                                + employee.getTargetRoleId()
                                )
                        );

        // -----------------------------------------------------
        // CREATE PEER ASSESSMENT ATTEMPT
        // -----------------------------------------------------

        AssessmentAttempt attempt =
                new AssessmentAttempt();

        attempt.setEmployee(employee);

        attempt.setAssessment(assessment);

        attempt.setAssessmentType(
                AssessmentType.PEER
        );

        // Employee who gave the peer assessment
        attempt.setEvaluator(evaluator);

        attempt.setCompletedAt(
                LocalDateTime.now()
        );

        attempt.setOverallScore(0.0);

        attempt.setPerformanceLevel(
                "Not Calculated"
        );

        attempt =
                assessmentAttemptRepository.save(attempt);

        // -----------------------------------------------------
        // PROCESS PEER RATINGS
        // -----------------------------------------------------

        List<AssessmentSkillResultResponse> skillResults =
                new ArrayList<>();

        double totalScore = 0.0;

        int ratingCount = 0;

        for (PeerSkillRatingRequest rating :
                request.getRatings()) {

            if (rating == null) {
                continue;
            }

            if (rating.getSkillName() == null ||
                    rating.getSkillName().isBlank()) {

                continue;
            }

            if (rating.getLevel() == null ||
                    rating.getLevel() < 1 ||
                    rating.getLevel() > 5) {

                throw new IllegalArgumentException(
                        "Skill level must be between 1 and 5."
                );
            }

            String skillName =
                    rating.getSkillName().trim();

            int level =
                    rating.getLevel();

            // -------------------------------------------------
            // CONVERT LEVEL TO SCORE
            // -------------------------------------------------

            int actualScore =
                    convertLevelToScore(level);

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

            // -------------------------------------------------
            // VALIDATE SKILL EXISTS
            // -------------------------------------------------

            Optional<Skill> skillOptional =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    skillName
                            );

            if (skillOptional.isEmpty()) {

                throw new RuntimeException(
                        "Skill not found: " + skillName
                );
            }

            // -------------------------------------------------
            // SAVE PEER ASSESSMENT RESULT
            // -------------------------------------------------

            PeerAssessmentResult peerResult =
                    new PeerAssessmentResult();

            peerResult.setAttempt(attempt);

            peerResult.setSkillName(skillName);

            peerResult.setRating(level);

            peerAssessmentResultRepository.save(
                    peerResult
            );

            // -------------------------------------------------
            // ADD RESULT FOR RESPONSE
            // -------------------------------------------------

            skillResults.add(
                    new AssessmentSkillResultResponse(
                            skillName,
                            actualScore,
                            requiredScore,
                            gap,
                            gapSeverity
                    )
            );

            totalScore += actualScore;

            ratingCount++;
        }

        // -----------------------------------------------------
        // VALIDATE RATINGS
        // -----------------------------------------------------

        if (ratingCount == 0) {

            throw new IllegalArgumentException(
                    "No valid skill ratings were submitted."
            );
        }

        // -----------------------------------------------------
        // CALCULATE OVERALL SCORE
        // -----------------------------------------------------

        double overallScore =
                totalScore / ratingCount;

        overallScore =
                Math.round(
                        overallScore * 100.0
                ) / 100.0;

        // -----------------------------------------------------
        // PERFORMANCE LEVEL
        // -----------------------------------------------------

        String performanceLevel =
                getPerformanceLevel(
                        overallScore
                );

        // -----------------------------------------------------
        // UPDATE ATTEMPT
        // -----------------------------------------------------

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
        // SEND NOTIFICATION TO EMPLOYEE BEING REVIEWED
        // =====================================================

        String evaluatorName =
                evaluator.getFirstName();

        if (evaluator.getLastName() != null &&
                !evaluator.getLastName().isBlank()) {

            evaluatorName +=
                    " " + evaluator.getLastName();
        }

        notificationService.createNotification(
                employee,
                "PEER_ASSESSMENT_COMPLETED",
                evaluatorName +
                        " has completed a peer assessment for you."
        );

        // -----------------------------------------------------
        // IMPORTANT
        // -----------------------------------------------------
        // We DO NOT:
        //
        // 1. Update EmployeeSkill.currentLevel
        // 2. Call KnowledgeGapService
        // 3. Save AssessmentGapResult
        //
        // Peer assessment is stored as peer feedback only.
        // -----------------------------------------------------

        // -----------------------------------------------------
        // RETURN RESULT
        // -----------------------------------------------------

        return new AssessmentResultResponse(
                attempt.getId(),
                assessment.getId(),
                assessment.getTitle(),
                overallScore,
                performanceLevel,
                null,
                ratingCount,
                skillResults
        );
    }

    // =========================================================
    // GET PEER REVIEWS RECEIVED BY EMPLOYEE
    // =========================================================

    @Transactional(readOnly = true)
    public List<PeerReviewResponse> getPeerReviews(
            String employeeIdentifier) {

        // -----------------------------------------------------
        // GET EMPLOYEE
        // -----------------------------------------------------

        Employee employee =
                employeeRepository
                        .findByEmployeeId(employeeIdentifier)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeIdentifier
                                )
                        );

        // -----------------------------------------------------
        // GET PEER ASSESSMENT ATTEMPTS
        // -----------------------------------------------------

        List<AssessmentAttempt> attempts =
                assessmentAttemptRepository
                        .findByEmployeeAndAssessmentTypeOrderByCompletedAtDesc(
                                employee,
                                AssessmentType.PEER
                        );

        List<PeerReviewResponse> reviews =
                new ArrayList<>();

        // -----------------------------------------------------
        // PROCESS EACH REVIEW
        // -----------------------------------------------------

        for (AssessmentAttempt attempt : attempts) {

            PeerReviewResponse response =
                    new PeerReviewResponse();

            response.setAttemptId(
                    attempt.getId()
            );

            response.setCompletedAt(
                    attempt.getCompletedAt()
            );

            response.setOverallScore(
                    attempt.getOverallScore()
            );

            response.setPerformanceLevel(
                    attempt.getPerformanceLevel()
            );

            // -------------------------------------------------
            // GET REVIEWER
            // -------------------------------------------------

            Employee evaluator =
                    attempt.getEvaluator();

            if (evaluator != null) {

                String reviewerName =
                        evaluator.getFirstName();

                if (evaluator.getLastName() != null &&
                        !evaluator.getLastName().isBlank()) {

                    reviewerName +=
                            " " + evaluator.getLastName();
                }

                response.setReviewerName(
                        reviewerName
                );

                response.setReviewerIdentifier(
                        evaluator.getEmployeeId()
                );
            }

            // -------------------------------------------------
            // GET SKILL RATINGS
            // -------------------------------------------------

            List<PeerAssessmentResult> results =
                    peerAssessmentResultRepository
                            .findByAttempt(attempt);

            List<PeerSkillReviewResponse> skillRatings =
                    new ArrayList<>();

            for (PeerAssessmentResult result :
                    results) {

                skillRatings.add(
                        new PeerSkillReviewResponse(
                                result.getSkillName(),
                                result.getRating(),
                                getRatingLevel(
                                        result.getRating()
                                )
                        )
                );
            }

            response.setSkillRatings(
                    skillRatings
            );

            reviews.add(response);
        }

        return reviews;
    }

    // =========================================================
    // RATING -> LEVEL NAME
    // =========================================================

    private String getRatingLevel(
            Integer rating) {

        if (rating == null) {
            return "Not Rated";
        }

        switch (rating) {

            case 1:
                return "Beginner";

            case 2:
                return "Intermediate";

            case 3:
                return "Competent";

            case 4:
                return "Advanced";

            case 5:
                return "Expert";

            default:
                return "Unknown";
        }
    }

    // =========================================================
    // LEVEL -> SCORE
    // =========================================================

    private int convertLevelToScore(
            int level) {

        switch (level) {

            case 1:
                return 20;

            case 2:
                return 40;

            case 3:
                return 60;

            case 4:
                return 80;

            case 5:
                return 100;

            default:
                return 0;
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