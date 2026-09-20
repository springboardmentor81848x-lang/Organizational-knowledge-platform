package com.okip.service.assessment.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.assessment.AssessmentAnswerRequestDTO;
import com.okip.dto.assessment.AssessmentResultDTO;
import com.okip.dto.assessment.AssessmentSubmitRequestDTO;
import com.okip.dto.assessment.SelfAssessmentDTO;
import com.okip.dto.assessment.SelfAssessmentQuestionDTO;

import com.okip.entity.assessment.Assessment;
import com.okip.entity.assessment.AssessmentAnswer;
import com.okip.entity.assessment.AssessmentAttempt;
import com.okip.entity.assessment.AssessmentOption;
import com.okip.entity.assessment.AssessmentQuestion;

import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;

import com.okip.entity.transaction.EmployeeSkill;

import com.okip.enums.ProficiencyLevel;

import com.okip.exception.ResourceNotFoundException;

import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;

import com.okip.repository.assessment.AssessmentAnswerRepository;
import com.okip.repository.assessment.AssessmentAttemptRepository;
import com.okip.repository.assessment.AssessmentOptionRepository;
import com.okip.repository.assessment.AssessmentQuestionRepository;
import com.okip.repository.assessment.AssessmentRepository;

import com.okip.service.assessment.SelfAssessmentService;
import com.okip.service.gap.GapAnalysisService;

@Service
@Transactional
public class SelfAssessmentServiceImpl
        implements SelfAssessmentService {

    // ============================================================
    // REPOSITORIES
    // ============================================================

    private final AssessmentRepository assessments;

    private final AssessmentQuestionRepository questions;

    private final AssessmentOptionRepository options;

    private final AssessmentAttemptRepository attempts;

    private final AssessmentAnswerRepository answers;

    private final EmployeeRepository employees;

    private final EmployeeSkillRepository employeeSkills;

    private final GapAnalysisService gapAnalysisService;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public SelfAssessmentServiceImpl(
            AssessmentRepository assessments,
            AssessmentQuestionRepository questions,
            AssessmentOptionRepository options,
            AssessmentAttemptRepository attempts,
            AssessmentAnswerRepository answers,
            EmployeeRepository employees,
            EmployeeSkillRepository employeeSkills,
            GapAnalysisService gapAnalysisService) {

        this.assessments = assessments;
        this.questions = questions;
        this.options = options;
        this.attempts = attempts;
        this.answers = answers;
        this.employees = employees;
        this.employeeSkills = employeeSkills;
        this.gapAnalysisService = gapAnalysisService;
    }


    // ============================================================
    // GET LOGGED-IN EMPLOYEE
    // ============================================================

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || authentication.getName() == null
                || authentication.getName().isBlank()) {

            throw new ResourceNotFoundException(
                    "Authenticated employee not found."
            );
        }

        return employees
                .findByOfficialEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."
                        )
                );
    }


    // ============================================================
    // DETERMINE PROFICIENCY FROM ASSESSMENT PERCENTAGE
    // ============================================================

    private ProficiencyLevel determineProficiency(
            double percentage) {

        if (percentage >= 80.0) {
            return ProficiencyLevel.EXPERT;
        }

        if (percentage >= 60.0) {
            return ProficiencyLevel.ADVANCED;
        }

        if (percentage >= 40.0) {
            return ProficiencyLevel.INTERMEDIATE;
        }

        return ProficiencyLevel.BEGINNER;
    }


    // ============================================================
    // GET MY ASSESSMENTS
    //
    // Only skills present in the employee's Skill Profile
    // are considered.
    // ============================================================

    @Override
    public List<SelfAssessmentDTO> getMyAssessments() {

        Employee employee =
                getLoggedInEmployee();

        List<SelfAssessmentDTO> result =
                new ArrayList<>();

        // Get only this employee's skills

        List<EmployeeSkill> mySkills =
                employeeSkills.findByEmployee(employee);

        for (EmployeeSkill employeeSkill : mySkills) {

            Skill skill =
                    employeeSkill.getSkill();

            if (skill == null) {
                continue;
            }

            Long skillId =
                    skill.getSkillId();

            // ----------------------------------------------------
            // Find SELF assessment for this skill
            // ----------------------------------------------------

            Assessment assessment =
                    assessments
                            .findBySkillSkillIdAndAssessmentTypeAndActiveTrue(
                                    skillId,
                                    Assessment.AssessmentType.SELF
                            )
                            .orElseGet(() -> {

                                Assessment newAssessment =
                                        new Assessment();

                                newAssessment.setSkill(skill);

                                newAssessment.setAssessmentType(
                                        Assessment.AssessmentType.SELF
                                );

                                newAssessment.setAssessmentName(
                                        skill.getSkillName()
                                                + " Technical Self Assessment"
                                );

                                newAssessment.setTotalMarks(50);

                                newAssessment.setActive(true);

                                return assessments.save(
                                        newAssessment
                                );
                            });

            // ----------------------------------------------------
            // Add assessment to response
            // ----------------------------------------------------

            result.add(
                    toDto(assessment)
            );
        }

        return result;
    }


    // ============================================================
    // GET SINGLE ASSESSMENT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public SelfAssessmentDTO getAssessment(Long id) {

        Assessment assessment =
                assessments
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment not found."
                                )
                        );

        return toDto(assessment);
    }


    // ============================================================
    // START ASSESSMENT
    // ============================================================

    @Override
    public AssessmentResultDTO start(Long id) {

        Employee employee =
                getLoggedInEmployee();

        Assessment assessment =
                assessments
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment not found."
                                )
                        );

        // --------------------------------------------------------
        // Security:
        // Assessment must belong to one of employee's skills
        // --------------------------------------------------------

        boolean ownsSkill =
                employeeSkills
                        .findByEmployee(employee)
                        .stream()
                        .anyMatch(employeeSkill ->
                                employeeSkill
                                        .getSkill()
                                        .getSkillId()
                                        .equals(
                                                assessment
                                                        .getSkill()
                                                        .getSkillId()
                                        )
                        );

        if (!ownsSkill) {

            throw new ResourceNotFoundException(
                    "This assessment is not assigned to one of your skills."
            );
        }

        // --------------------------------------------------------
        // Create attempt
        // --------------------------------------------------------

        AssessmentAttempt attempt =
                new AssessmentAttempt();

        attempt.setEmployee(employee);

        attempt.setAssessment(assessment);

        attempt.setStartedAt(
                LocalDateTime.now()
        );

        attempt.setStatus(
                AssessmentAttempt.Status.IN_PROGRESS
        );

        AssessmentAttempt savedAttempt =
                attempts.save(attempt);

        // Recalculate the employee's knowledge gaps immediately after
        // the assessment updates EmployeeSkill.proficiencyLevel.
        gapAnalysisService.runGapAnalysis(
                employee.getEmployeeId());

        return result(savedAttempt);
    }


    // ============================================================
    // SUBMIT ASSESSMENT
    // ============================================================

    @Override
    public AssessmentResultDTO submit(
            Long attemptId,
            AssessmentSubmitRequestDTO request) {

        Employee employee =
                getLoggedInEmployee();

        AssessmentAttempt attempt =
                attempts
                        .findByAttemptIdAndEmployeeEmployeeId(
                                attemptId,
                                employee.getEmployeeId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment attempt not found."
                                )
                        );

        // --------------------------------------------------------
        // Already submitted
        // --------------------------------------------------------

        if (attempt.getStatus()
                == AssessmentAttempt.Status.SUBMITTED) {

            return result(attempt);
        }

        // --------------------------------------------------------
        // Load questions
        // --------------------------------------------------------

        List<AssessmentQuestion> assessmentQuestions =
                questions
                        .findByAssessmentAssessmentIdOrderByQuestionOrderAsc(
                                attempt
                                        .getAssessment()
                                        .getAssessmentId()
                        );

        Map<Long, AssessmentQuestion> questionMap =
                assessmentQuestions
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        AssessmentQuestion::getQuestionId,
                                        question -> question
                                )
                        );

        int score = 0;

        // --------------------------------------------------------
        // Evaluate submitted answers
        // --------------------------------------------------------

        if (request != null
                && request.answers != null) {

            for (
                    AssessmentAnswerRequestDTO submittedAnswer
                    : request.answers
            ) {

                AssessmentQuestion question =
                        questionMap.get(
                                submittedAnswer.questionId
                        );

                // Invalid question ID

                if (question == null) {
                    continue;
                }

                AssessmentAnswer answer =
                        new AssessmentAnswer();

                answer.setAttempt(attempt);

                answer.setQuestion(question);

                answer.setCodeAnswer(
                        submittedAnswer.codeAnswer
                );

                int marks = 0;

                // ------------------------------------------------
                // MCQ AUTO EVALUATION
                // ------------------------------------------------

                if (
                        question.getQuestionType()
                                == AssessmentQuestion.QuestionType.MCQ

                        &&

                        submittedAnswer.selectedOptionId != null
                ) {

                    AssessmentOption option =
                            options
                                    .findById(
                                            submittedAnswer
                                                    .selectedOptionId
                                    )
                                    .orElse(null);

                    if (
                            option != null

                            &&

                            option
                                    .getQuestion()
                                    .getQuestionId()
                                    .equals(
                                            question.getQuestionId()
                                    )
                    ) {

                        answer.setSelectedOption(
                                option
                        );

                        if (option.isCorrect()) {

                            marks =
                                    question.getMarks();
                        }
                    }
                }

                /*
                 * Coding questions:
                 *
                 * The code answer is stored.
                 * Coding evaluation is not implemented yet.
                 */

                answer.setMarksAwarded(marks);

                answers.save(answer);

                score += marks;
            }
        }

        // --------------------------------------------------------
        // Save score
        // --------------------------------------------------------

        attempt.setScore(score);

        // --------------------------------------------------------
        // Calculate percentage
        // --------------------------------------------------------

        double percentage = 0.0;

        Integer totalMarks =
                attempt
                        .getAssessment()
                        .getTotalMarks();

        if (
                totalMarks != null
                && totalMarks > 0
        ) {

            percentage =
                    Math.round(
                            (
                                    score
                                    * 100.0
                                    /
                                    totalMarks
                            )
                            * 100.0
                    )
                    / 100.0;
        }

        attempt.setPercentage(
                percentage
        );

        // --------------------------------------------------------
        // UPDATE EMPLOYEE SKILL PROFICIENCY
        // FROM ASSESSMENT SCORE
        // --------------------------------------------------------

        ProficiencyLevel assessedProficiency =
                determineProficiency(percentage);

        employeeSkills
                .findByEmployeeAndSkill(
                        employee,
                        attempt
                                .getAssessment()
                                .getSkill()
                )
                .ifPresent(employeeSkill -> {

                    employeeSkill.setProficiencyLevel(
                            assessedProficiency
                    );

                    employeeSkills.save(employeeSkill);
                });

        // --------------------------------------------------------
        // Mark submitted
        // --------------------------------------------------------

        attempt.setStatus(
                AssessmentAttempt.Status.SUBMITTED
        );

        attempt.setSubmittedAt(
                LocalDateTime.now()
        );

        AssessmentAttempt savedAttempt =
                attempts.save(attempt);

        // Recalculate the employee's knowledge gaps immediately after
        // the assessment updates EmployeeSkill.proficiencyLevel.
        gapAnalysisService.runGapAnalysis(
                employee.getEmployeeId());

        return result(savedAttempt);
    }


    // ============================================================
    // CONVERT ASSESSMENT TO DTO
    // ============================================================

    private SelfAssessmentDTO toDto(
            Assessment assessment) {

        SelfAssessmentDTO dto =
                new SelfAssessmentDTO();

        dto.assessmentId =
                assessment.getAssessmentId();

        dto.skillId =
                assessment
                        .getSkill()
                        .getSkillId();

        dto.skillName =
                assessment
                        .getSkill()
                        .getSkillName();

        dto.assessmentName =
                assessment
                        .getAssessmentName();

        dto.totalMarks =
                assessment
                        .getTotalMarks();

        // ----------------------------------------------------
        // Load questions
        // ----------------------------------------------------

        List<AssessmentQuestion> assessmentQuestions =
                questions
                        .findByAssessmentAssessmentIdOrderByQuestionOrderAsc(
                                assessment.getAssessmentId()
                        );

        for (
                AssessmentQuestion question
                : assessmentQuestions
        ) {

            SelfAssessmentQuestionDTO questionDTO =
                    new SelfAssessmentQuestionDTO();

            questionDTO.questionId =
                    question.getQuestionId();

            questionDTO.type =
                    question
                            .getQuestionType()
                            .name();

            questionDTO.difficulty =
                    question
                            .getDifficulty()
                            .name();

            questionDTO.questionText =
                    question
                            .getQuestionText();

            questionDTO.marks =
                    question
                            .getMarks();

            questionDTO.starterCode =
                    question
                            .getStarterCode();

            // ----------------------------------------------------
            // MCQ OPTIONS
            // ----------------------------------------------------

            List<AssessmentOption> questionOptions =
                    options
                            .findByQuestionQuestionIdOrderByOptionOrderAsc(
                                    question.getQuestionId()
                            );

            for (
                    AssessmentOption option
                    : questionOptions
            ) {

                SelfAssessmentQuestionDTO.OptionDTO optionDTO =
                        new SelfAssessmentQuestionDTO.OptionDTO();

                optionDTO.optionId =
                        option.getOptionId();

                optionDTO.optionText =
                        option.getOptionText();

                optionDTO.optionOrder =
                        option.getOptionOrder();

                questionDTO.options.add(
                        optionDTO
                );
            }

            dto.questions.add(
                    questionDTO
            );
        }

        return dto;
    }


    // ============================================================
    // CONVERT ATTEMPT TO RESULT DTO
    // ============================================================

    private AssessmentResultDTO result(
            AssessmentAttempt attempt) {

        AssessmentResultDTO dto =
                new AssessmentResultDTO();

        dto.attemptId =
                attempt.getAttemptId();

        dto.assessmentId =
                attempt
                        .getAssessment()
                        .getAssessmentId();

        dto.skillName =
                attempt
                        .getAssessment()
                        .getSkill()
                        .getSkillName();

        dto.score =
                attempt.getScore();

        dto.totalMarks =
                attempt
                        .getAssessment()
                        .getTotalMarks();

        dto.percentage =
                attempt.getPercentage();

        dto.status =
                attempt
                        .getStatus()
                        .name();

        return dto;
    }
}