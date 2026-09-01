package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.ManagerAssessmentRequest;
import com.knowledgegap.dto.ManagerAssessmentResponse;
import com.knowledgegap.dto.ManagerAssessmentSkillRequest;
import com.knowledgegap.dto.ManagerAssessmentSkillResultResponse;

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
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
public class ManagerAssessmentService {

    private final AssessmentRepository assessmentRepository;

    private final AssessmentAttemptRepository assessmentAttemptRepository;

    private final AssessmentGapResultRepository assessmentGapResultRepository;

    private final EmployeeService employeeService;

    private final EmployeeSkillRepository employeeSkillRepository;

    private final SkillRepository skillRepository;

    private final EmployeeSkillService employeeSkillService;

    private final KnowledgeGapService knowledgeGapService;

    public ManagerAssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentGapResultRepository assessmentGapResultRepository,
            EmployeeService employeeService,
            EmployeeSkillRepository employeeSkillRepository,
            SkillRepository skillRepository,
            EmployeeSkillService employeeSkillService,
            KnowledgeGapService knowledgeGapService) {

        this.assessmentRepository =
                assessmentRepository;

        this.assessmentAttemptRepository =
                assessmentAttemptRepository;

        this.assessmentGapResultRepository =
                assessmentGapResultRepository;

        this.employeeService =
                employeeService;

        this.employeeSkillRepository =
                employeeSkillRepository;

        this.skillRepository =
                skillRepository;

        this.employeeSkillService =
                employeeSkillService;

        this.knowledgeGapService =
                knowledgeGapService;
    }

    // =========================================================
    // GET EMPLOYEE SKILLS
    // =========================================================

    public List<EmployeeSkill> getEmployeeSkills(
            String employeeIdentifier) {

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

        return employeeSkillRepository
                .findByEmployee(employee);
    }

    // =========================================================
    // SUBMIT MANAGER ASSESSMENT
    // =========================================================

    @Transactional
    public ManagerAssessmentResponse submitManagerAssessment(
            ManagerAssessmentRequest request) {

        // =====================================================
        // VALIDATE REQUEST
        // =====================================================

        if (request == null) {

            throw new IllegalArgumentException(
                    "Manager assessment request cannot be null."
            );
        }

        if (request.getEmployeeIdentifier() == null ||
                request.getEmployeeIdentifier().isBlank()) {

            throw new IllegalArgumentException(
                    "Employee identifier is required."
            );
        }

        if (request.getManagerIdentifier() == null ||
                request.getManagerIdentifier().isBlank()) {

            throw new IllegalArgumentException(
                    "Manager identifier is required."
            );
        }

        if (request.getSkills() == null ||
                request.getSkills().isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one skill rating is required."
            );
        }

        // =====================================================
        // GET EMPLOYEE
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
        // GET MANAGER
        // =====================================================

        Employee manager =
                employeeService
                        .getEmployeeByIdentifier(
                                request.getManagerIdentifier()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Manager not found: "
                                                + request.getManagerIdentifier()
                                )
                        );

        // =====================================================
        // MANAGER CANNOT ASSESS THEMSELVES
        // =====================================================

        if (manager.getId().equals(employee.getId())) {

            throw new IllegalArgumentException(
                    "Manager cannot assess themselves."
            );
        }

        // =====================================================
        // FIND CORRECT ASSESSMENT
        // =====================================================
        //
        // Database:
        //
        // 2 = Software Developer
        // 3 = Software Tester
        // 4 = Data Analyst
        // 5 = Data Scientist
        // 6 = DevOps Engineer
        // 7 = UI/UX Designer
        // 8 = Cybersecurity Analyst
        // 9 = Database Administrator
        //
        // employee.targetRoleId matches:
        //
        // 1 -> Assessment ID 2
        // 2 -> Assessment ID 3
        // 3 -> Assessment ID 4
        // etc.
        //
        // =====================================================

        Assessment assessment = null;

        /*
         * First try the assessmentId sent by frontend.
         *
         * If frontend sends an invalid ID such as 1,
         * we will NOT immediately throw an exception.
         */
        if (request.getAssessmentId() != null) {

            Optional<Assessment> requestedAssessment =
                    assessmentRepository.findById(
                            request.getAssessmentId()
                    );

            if (requestedAssessment.isPresent()) {

                assessment =
                        requestedAssessment.get();
            }
        }

        /*
         * If the requested assessment does not exist,
         * automatically find the assessment based on
         * employee.targetRoleId.
         */
        if (assessment == null) {

            Long targetRoleId =
                    employee.getTargetRoleId();

            if (targetRoleId == null) {

                throw new RuntimeException(
                        "Employee "
                                + employee.getEmployeeId()
                                + " does not have a target role assigned."
                );
            }

            assessment =
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
        }

        // =====================================================
        // CHECK ASSESSMENT ACTIVE
        // =====================================================

        if (!Boolean.TRUE.equals(
                assessment.getActive())) {

            throw new IllegalStateException(
                    "This assessment is not active."
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
                AssessmentType.MANAGER
        );

        attempt.setEvaluator(manager);

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
        // PROCESS SKILLS
        // =====================================================

        List<ManagerAssessmentSkillResultResponse>
                skillResults =
                new ArrayList<>();

        double totalRating = 0.0;

        int skillCount = 0;

        for (
                ManagerAssessmentSkillRequest skillRequest :
                request.getSkills()
        ) {

            if (skillRequest == null) {
                continue;
            }

            String skillName =
                    skillRequest.getSkillName();

            if (skillName == null ||
                    skillName.isBlank()) {

                continue;
            }

            skillName =
                    skillName.trim();

            Integer rating =
                    skillRequest.getRating();

            // =================================================
            // VALIDATE RATING
            // =================================================

            if (rating == null ||
                    rating < 1 ||
                    rating > 5) {

                throw new IllegalArgumentException(
                        "Rating for "
                                + skillName
                                + " must be between 1 and 5."
                );
            }

            // =================================================
            // PREVIOUS LEVEL
            // =================================================

            int previousLevel = 1;

            Optional<Skill> skillOptional =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    skillName
                            );

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
            // MANAGER RATING = ASSESSED LEVEL
            // =================================================

            int assessedLevel =
                    normalizeLevel(rating);

            // =================================================
            // IMPROVEMENT
            // =================================================

            int improvement =
                    assessedLevel -
                            previousLevel;

            // =================================================
            // CONVERT LEVEL TO SCORE
            // =================================================

            int actualScore =
                    convertLevelToScore(
                            assessedLevel
                    );

            // =================================================
            // REQUIRED SCORE
            // =================================================

            int requiredScore = 70;

            // =================================================
            // GAP
            // =================================================

            int gap =
                    Math.max(
                            requiredScore -
                                    actualScore,
                            0
                    );

            // =================================================
            // GAP SEVERITY
            // =================================================

            String gapSeverity =
                    getGapSeverity(gap);

            // =================================================
            // LEVEL NAME
            // =================================================

            String level =
                    getLevelName(
                            assessedLevel
                    );

            // =================================================
            // SAVE GAP RESULT
            // =================================================

            AssessmentGapResult gapResult =
                    new AssessmentGapResult();

            gapResult.setAttempt(attempt);

            gapResult.setSkillName(skillName);

            gapResult.setActualScore(actualScore);

            gapResult.setRequiredScore(requiredScore);

            gapResult.setGap(gap);

            gapResult.setGapSeverity(gapSeverity);

            gapResult.setPreviousLevel(previousLevel);

            gapResult.setAssessedLevel(assessedLevel);

            gapResult.setImprovement(improvement);

            assessmentGapResultRepository.save(
                    gapResult
            );

            // =================================================
            // ADD RESULT
            // =================================================

            skillResults.add(
                    new ManagerAssessmentSkillResultResponse(
                            skillName,
                            rating,
                            level,
                            previousLevel,
                            improvement,
                            requiredScore,
                            actualScore,
                            gap,
                            gapSeverity
                    )
            );

            totalRating += assessedLevel;

            skillCount++;
        }

        // =====================================================
        // VALIDATE SKILL COUNT
        // =====================================================

        if (skillCount == 0) {

            throw new IllegalArgumentException(
                    "No valid skill ratings were submitted."
            );
        }

        // =====================================================
        // OVERALL SCORE
        // =====================================================

        double averageRating =
                totalRating / skillCount;

        double overallScore =
                ((averageRating - 1.0) / 4.0)
                        * 100.0;

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
        // UPDATE EMPLOYEE SKILLS
        // =====================================================

        employeeSkillService
                .updateSkillsFromManagerAssessment(
                        employee,
                        skillResults
                );

        // =====================================================
        // RECALCULATE KNOWLEDGE GAPS
        // =====================================================

        try {

            knowledgeGapService
                    .detectAndSaveGaps(
                            employee
                    );

        } catch (Exception e) {

            System.out.println(
                    "WARNING: Knowledge gap recalculation failed: "
                            + e.getMessage()
            );
        }

        // =====================================================
        // RETURN RESPONSE
        // =====================================================

        return new ManagerAssessmentResponse(
                attempt.getId(),
                assessment.getId(),
                assessment.getTitle(),
                employee.getEmployeeId(),
                manager.getEmployeeId(),
                overallScore,
                performanceLevel,
                skillResults
        );
    }

    // =========================================================
    // CONVERT LEVEL TO SCORE
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