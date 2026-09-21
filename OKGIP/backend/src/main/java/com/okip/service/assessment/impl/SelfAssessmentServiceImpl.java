package com.okip.service.assessment.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.JobRoleCompetency;

import com.okip.enums.ProficiencyLevel;

import com.okip.exception.ResourceNotFoundException;

import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.JobRoleCompetencyRepository;

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

    private final EmployeeJobRoleRepository employeeJobRoles;

    private final JobRoleCompetencyRepository jobRoleCompetencies;

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
            EmployeeJobRoleRepository employeeJobRoles,
            JobRoleCompetencyRepository jobRoleCompetencies,
            GapAnalysisService gapAnalysisService) {

        this.assessments = assessments;
        this.questions = questions;
        this.options = options;
        this.attempts = attempts;
        this.answers = answers;
        this.employees = employees;
        this.employeeSkills = employeeSkills;
        this.employeeJobRoles = employeeJobRoles;
        this.jobRoleCompetencies = jobRoleCompetencies;
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
                    "Authenticated employee not found.");
        }

        return employees
                .findByOfficialEmail(
                        authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Employee not found."));
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
    // GET REQUIRED SKILLS FROM ACTIVE JOB ROLES
    // ============================================================
    /*
     * Employee
     *     ↓
     * Active EmployeeJobRole
     *     ↓
     * JobRole
     *     ↓
     * JobRoleCompetency
     *     ↓
     * Required Skill
     *
     * This is now the SOURCE OF TRUTH for assessments.
     */

    private List<Skill> getRequiredSkillsForEmployee(
            Employee employee) {

        List<EmployeeJobRole> activeRoles =
                employeeJobRoles
                        .findByEmployeeAndActiveTrue(
                                employee);

        if (activeRoles == null
                || activeRoles.isEmpty()) {

            return new ArrayList<>();
        }

        /*
         * LinkedHashMap/Set is not required here because
         * we only need unique Skill IDs.
         */
        Set<Long> skillIds =
                new HashSet<>();

        List<Skill> requiredSkills =
                new ArrayList<>();

        for (EmployeeJobRole employeeJobRole
                : activeRoles) {

            if (employeeJobRole.getJobRole() == null) {
                continue;
            }

            List<JobRoleCompetency> competencies =
                    jobRoleCompetencies
                            .findByJobRole(
                                    employeeJobRole.getJobRole());

            for (JobRoleCompetency competency
                    : competencies) {

                if (competency == null
                        || competency.getSkill() == null) {
                    continue;
                }

                Skill skill =
                        competency.getSkill();

                if (skill.getSkillId() == null) {
                    continue;
                }

                /*
                 * Prevent duplicate skills when two roles
                 * require the same skill.
                 */
                if (skillIds.add(
                        skill.getSkillId())) {

                    requiredSkills.add(skill);
                }
            }
        }

        return requiredSkills;
    }


    // ============================================================
    // ENSURE REQUIRED SKILL EXISTS IN EMPLOYEE PROFILE
    // ============================================================

    private void ensureEmployeeSkill(
            Employee employee,
            Skill skill) {

        if (skill == null) {
            return;
        }

        boolean exists =
                employeeSkills
                        .findByEmployeeAndSkill(
                                employee,
                                skill)
                        .isPresent();

        if (!exists) {

            EmployeeSkill employeeSkill =
                    new EmployeeSkill();

            employeeSkill.setEmployee(employee);
            employeeSkill.setSkill(skill);

            /*
             * Newly required skill starts at BEGINNER.
             *
             * Assessment result will update this
             * proficiency later.
             */
            employeeSkill.setProficiencyLevel(
                    ProficiencyLevel.BEGINNER);

            employeeSkill.setYearsOfExperience(0.0);

            employeeSkills.save(employeeSkill);
        }
    }


    // ============================================================
    // GET MY ASSESSMENTS
    // ============================================================
    /*
     * OLD FLOW:
     *
     * EmployeeSkill
     *      ↓
     * Assessment
     *
     * NEW FLOW:
     *
     * Active Job Role
     *      ↓
     * Job Role Competency
     *      ↓
     * Required Skill
     *      ↓
     * Assessment
     */

    @Override
    public List<SelfAssessmentDTO> getMyAssessments() {

        Employee employee =
                getLoggedInEmployee();

        List<SelfAssessmentDTO> result =
                new ArrayList<>();

        // --------------------------------------------------------
        // Get skills required by employee's active job roles
        // --------------------------------------------------------

        List<Skill> requiredSkills =
                getRequiredSkillsForEmployee(
                        employee);

        // --------------------------------------------------------
        // No job role assigned
        // --------------------------------------------------------

        if (requiredSkills.isEmpty()) {

            return result;
        }

        // --------------------------------------------------------
        // Create/find assessment for each required skill
        // --------------------------------------------------------

        for (Skill skill : requiredSkills) {

            if (skill == null) {
                continue;
            }

            /*
             * Make sure this required skill is also present
             * in Employee Skill Profile.
             *
             * This also supports older job-role assignments
             * created before the new initialization logic.
             */
            ensureEmployeeSkill(
                    employee,
                    skill);

            Long skillId =
                    skill.getSkillId();

            Assessment assessment =
                    assessments
                            .findBySkillSkillIdAndAssessmentTypeAndActiveTrue(
                                    skillId,
                                    Assessment.AssessmentType.SELF)
                            .orElseGet(() -> {

                                Assessment newAssessment =
                                        new Assessment();

                                newAssessment.setSkill(skill);

                                newAssessment.setAssessmentType(
                                        Assessment.AssessmentType.SELF);

                                newAssessment.setAssessmentName(
                                        skill.getSkillName()
                                                + " Technical Self Assessment");

                                newAssessment.setTotalMarks(50);

                                newAssessment.setActive(true);

                                return assessments.save(
                                        newAssessment);
                            });

            result.add(
                    toDto(assessment));
        }

        return result;
    }


    // ============================================================
    // GET SINGLE ASSESSMENT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public SelfAssessmentDTO getAssessment(
            Long id) {

        Assessment assessment =
                assessments
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment not found."));

        return toDto(assessment);
    }


    // ============================================================
    // START ASSESSMENT
    // ============================================================

    @Override
    public AssessmentResultDTO start(
            Long id) {

        Employee employee =
                getLoggedInEmployee();

        Assessment assessment =
                assessments
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment not found."));

        // --------------------------------------------------------
        // Validate assessment skill
        // --------------------------------------------------------

        Skill assessmentSkill =
                assessment.getSkill();

        if (assessmentSkill == null) {

            throw new ResourceNotFoundException(
                    "Assessment skill not found.");
        }

        // --------------------------------------------------------
        // SECURITY:
        // Assessment skill MUST belong to one of the employee's
        // active Job Role competencies.
        // --------------------------------------------------------

        boolean requiredByJobRole =
                getRequiredSkillsForEmployee(employee)
                        .stream()
                        .anyMatch(skill ->
                                skill.getSkillId()
                                        .equals(
                                                assessmentSkill
                                                        .getSkillId()));

        if (!requiredByJobRole) {

            throw new ResourceNotFoundException(
                    "This assessment is not required for your assigned job role.");
        }

        // --------------------------------------------------------
        // Make sure EmployeeSkill exists
        // --------------------------------------------------------

        ensureEmployeeSkill(
                employee,
                assessmentSkill);

        // --------------------------------------------------------
        // Create attempt
        // --------------------------------------------------------

        AssessmentAttempt attempt =
                new AssessmentAttempt();

        attempt.setEmployee(employee);

        attempt.setAssessment(assessment);

        attempt.setStartedAt(
                LocalDateTime.now());

        attempt.setStatus(
                AssessmentAttempt.Status.IN_PROGRESS);

        AssessmentAttempt savedAttempt =
                attempts.save(attempt);

        /*
         * Do not change proficiency here.
         *
         * Proficiency changes only after submission.
         */

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
                                employee.getEmployeeId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment attempt not found."));

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
                                        .getAssessmentId());

        Map<Long, AssessmentQuestion> questionMap =
                assessmentQuestions
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        AssessmentQuestion::getQuestionId,
                                        question -> question));

        int score = 0;

        // --------------------------------------------------------
        // Evaluate submitted answers
        // --------------------------------------------------------

        if (request != null
                && request.answers != null) {

            for (
                    AssessmentAnswerRequestDTO submittedAnswer
                    : request.answers) {

                AssessmentQuestion question =
                        questionMap.get(
                                submittedAnswer.questionId);

                // Invalid question ID
                if (question == null) {
                    continue;
                }

                AssessmentAnswer answer =
                        new AssessmentAnswer();

                answer.setAttempt(attempt);

                answer.setQuestion(question);

                answer.setCodeAnswer(
                        submittedAnswer.codeAnswer);

                int marks = 0;

                // ------------------------------------------------
                // MCQ AUTO EVALUATION
                // ------------------------------------------------

                if (
                        question.getQuestionType()
                                == AssessmentQuestion.QuestionType.MCQ

                        &&

                        submittedAnswer.selectedOptionId
                                != null
                ) {

                    AssessmentOption option =
                            options
                                    .findById(
                                            submittedAnswer
                                                    .selectedOptionId)
                                    .orElse(null);

                    if (
                            option != null

                            &&

                            option.getQuestion()
                                    .getQuestionId()
                                    .equals(
                                            question.getQuestionId())
                    ) {

                        answer.setSelectedOption(
                                option);

                        if (option.isCorrect()) {

                            marks =
                                    question.getMarks();
                        }
                    }
                }

                /*
                 * Coding questions:
                 *
                 * Code answer is stored.
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
                percentage);

        // --------------------------------------------------------
        // UPDATE EMPLOYEE SKILL PROFICIENCY
        // --------------------------------------------------------

        ProficiencyLevel assessedProficiency =
                determineProficiency(
                        percentage);

        employeeSkills
                .findByEmployeeAndSkill(
                        employee,
                        attempt
                                .getAssessment()
                                .getSkill())
                .ifPresentOrElse(

                        employeeSkill -> {

                            employeeSkill
                                    .setProficiencyLevel(
                                            assessedProficiency);

                            employeeSkills.save(
                                    employeeSkill);
                        },

                        () -> {

                            /*
                             * Safety fallback:
                             * create EmployeeSkill if it somehow
                             * does not exist.
                             */

                            EmployeeSkill employeeSkill =
                                    new EmployeeSkill();

                            employeeSkill.setEmployee(
                                    employee);

                            employeeSkill.setSkill(
                                    attempt
                                            .getAssessment()
                                            .getSkill());

                            employeeSkill
                                    .setProficiencyLevel(
                                            assessedProficiency);

                            employeeSkill
                                    .setYearsOfExperience(
                                            0.0);

                            employeeSkills.save(
                                    employeeSkill);
                        }
                );

        // --------------------------------------------------------
        // Mark submitted
        // --------------------------------------------------------

        attempt.setStatus(
                AssessmentAttempt.Status.SUBMITTED);

        attempt.setSubmittedAt(
                LocalDateTime.now());

        AssessmentResultDTO response;

        AssessmentAttempt savedAttempt =
                attempts.save(attempt);

        // --------------------------------------------------------
        // Recalculate knowledge gaps
        // --------------------------------------------------------

        gapAnalysisService.runGapAnalysis(
                employee.getEmployeeId());

        response =
                result(savedAttempt);

        return response;
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

        // --------------------------------------------------------
        // Load questions
        // --------------------------------------------------------

        List<AssessmentQuestion> assessmentQuestions =
                questions
                        .findByAssessmentAssessmentIdOrderByQuestionOrderAsc(
                                assessment.getAssessmentId());

        for (
                AssessmentQuestion question
                : assessmentQuestions) {

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
                                    question.getQuestionId());

            for (
                    AssessmentOption option
                    : questionOptions) {

                SelfAssessmentQuestionDTO.OptionDTO optionDTO =
                        new SelfAssessmentQuestionDTO.OptionDTO();

                optionDTO.optionId =
                        option.getOptionId();

                optionDTO.optionText =
                        option.getOptionText();

                optionDTO.optionOrder =
                        option.getOptionOrder();

                questionDTO.options.add(
                        optionDTO);
            }

            dto.questions.add(
                    questionDTO);
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