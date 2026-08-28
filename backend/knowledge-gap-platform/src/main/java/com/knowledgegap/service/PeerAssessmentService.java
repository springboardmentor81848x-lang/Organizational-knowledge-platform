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
import com.knowledgegap.dto.PeerSkillRatingRequest;
import com.knowledgegap.entity.Assessment;
import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.AssessmentType;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentGapResultRepository;
import com.knowledgegap.repository.AssessmentRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
public class PeerAssessmentService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AssessmentGapResultRepository assessmentGapResultRepository;
    private final KnowledgeGapService knowledgeGapService;

    public PeerAssessmentService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            SkillRepository skillRepository,
            AssessmentRepository assessmentRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentGapResultRepository assessmentGapResultRepository,
            KnowledgeGapService knowledgeGapService) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
        this.assessmentRepository = assessmentRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.assessmentGapResultRepository = assessmentGapResultRepository;
        this.knowledgeGapService = knowledgeGapService;
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
        // CREATE ATTEMPT
        // -----------------------------------------------------

        AssessmentAttempt attempt =
                new AssessmentAttempt();

        attempt.setEmployee(employee);
        attempt.setAssessment(assessment);
        attempt.setAssessmentType(
                AssessmentType.PEER
        );
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
        // PROCESS RATINGS
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
            // FIND SKILL
            // -------------------------------------------------

            Optional<Skill> skillOptional =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    skillName
                            );

            // -------------------------------------------------
            // GET PREVIOUS LEVEL
            // -------------------------------------------------

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

            // -------------------------------------------------
            // IMPROVEMENT
            // -------------------------------------------------

            int improvement =
                    level - previousLevel;

            // -------------------------------------------------
            // SAVE GAP RESULT
            // -------------------------------------------------

            AssessmentGapResult gapResult =
                    new AssessmentGapResult();

            gapResult.setAttempt(attempt);
            gapResult.setSkillName(skillName);
            gapResult.setActualScore(actualScore);
            gapResult.setRequiredScore(requiredScore);
            gapResult.setGap(gap);
            gapResult.setGapSeverity(gapSeverity);
            gapResult.setPreviousLevel(previousLevel);
            gapResult.setAssessedLevel(level);
            gapResult.setImprovement(improvement);

            assessmentGapResultRepository.save(
                    gapResult
            );

            // -------------------------------------------------
            // ADD RESULT
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
        // OVERALL SCORE
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

        // -----------------------------------------------------
        // UPDATE EMPLOYEE SKILLS
        // -----------------------------------------------------

        updateEmployeeSkills(
                employee,
                request.getRatings()
        );

        // -----------------------------------------------------
        // RECALCULATE KNOWLEDGE GAPS
        // -----------------------------------------------------

        try {

            knowledgeGapService
                    .detectAndSaveGaps(employee);

            System.out.println(
                    "Knowledge gaps recalculated "
                            + "after peer assessment."
            );

        } catch (Exception e) {

            System.out.println(
                    "WARNING: Knowledge gap "
                            + "recalculation failed: "
                            + e.getMessage()
            );
        }

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
    // UPDATE EMPLOYEE SKILLS
    // =========================================================

    private void updateEmployeeSkills(
            Employee employee,
            List<PeerSkillRatingRequest> ratings) {

        for (PeerSkillRatingRequest rating : ratings) {

            if (rating == null ||
                    rating.getSkillName() == null ||
                    rating.getSkillName().isBlank()) {

                continue;
            }

            String skillName =
                    rating.getSkillName().trim();

            int level =
                    normalizeLevel(
                            rating.getLevel()
                    );

            Skill skill =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    skillName
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Skill not found: "
                                                    + skillName
                                    )
                            );

            Optional<EmployeeSkill>
                    existingSkill =
                    employeeSkillRepository
                            .findByEmployeeAndSkill(
                                    employee,
                                    skill
                            );

            EmployeeSkill employeeSkill;

            if (existingSkill.isPresent()) {

                employeeSkill =
                        existingSkill.get();

            } else {

                employeeSkill =
                        new EmployeeSkill();

                employeeSkill.setEmployee(
                        employee
                );

                employeeSkill.setSkill(
                        skill
                );
            }

            employeeSkill.setCurrentLevel(level);

            employeeSkillRepository.save(
                    employeeSkill
            );
        }

        employeeSkillRepository.flush();
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