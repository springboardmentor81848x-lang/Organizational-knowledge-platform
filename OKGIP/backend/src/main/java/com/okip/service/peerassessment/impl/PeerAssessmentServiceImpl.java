package com.okip.service.peerassessment.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.peerassessment.PeerAnswerRequestDTO;
import com.okip.dto.peerassessment.PeerAssessmentDTO;
import com.okip.dto.peerassessment.PeerAssessmentResultDTO;
import com.okip.dto.peerassessment.PeerDTO;
import com.okip.dto.peerassessment.PeerQuestionDTO;
import com.okip.dto.peerassessment.PeerSkillDTO;
import com.okip.entity.assessment.Assessment;
import com.okip.entity.assessment.AssessmentAnswer;
import com.okip.entity.assessment.AssessmentAttempt;
import com.okip.entity.assessment.AssessmentQuestion;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.SkillRepository;
import com.okip.repository.assessment.AssessmentAnswerRepository;
import com.okip.repository.assessment.AssessmentAttemptRepository;
import com.okip.repository.assessment.AssessmentQuestionRepository;
import com.okip.repository.assessment.AssessmentRepository;
import com.okip.service.peerassessment.PeerAssessmentService;

@Service
@Transactional
public class PeerAssessmentServiceImpl
        implements PeerAssessmentService {
                

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository questionRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAnswerRepository answerRepository;
    private final SkillRepository skillRepository;

    public PeerAssessmentServiceImpl(
        EmployeeRepository employeeRepository,
        EmployeeSkillRepository employeeSkillRepository,
        SkillRepository skillRepository,
        AssessmentRepository assessmentRepository,
        AssessmentQuestionRepository questionRepository,
        AssessmentAttemptRepository attemptRepository,
        AssessmentAnswerRepository answerRepository
) {
    this.employeeRepository = employeeRepository;
    this.employeeSkillRepository = employeeSkillRepository;
    this.skillRepository = skillRepository;
    this.assessmentRepository = assessmentRepository;
    this.questionRepository = questionRepository;
    this.attemptRepository = attemptRepository;
    this.answerRepository = answerRepository;
}

    
    @Override
    @Transactional(readOnly = true)
    public List<PeerDTO> getAvailablePeers() {

        Employee currentEmployee = getLoggedInEmployee();

        return employeeRepository
                .findByStatus(currentEmployee.getStatus())
                .stream()
                .filter(employee ->
                        !employee.getEmployeeId()
                                .equals(currentEmployee.getEmployeeId()))
                .filter(employee -> {

                    if (currentEmployee.getDepartment() == null
                            || employee.getDepartment() == null) {
                        return true;
                    }

                    return currentEmployee.getDepartment()
                            .getDepartmentId()
                            .equals(
                                    employee.getDepartment()
                                            .getDepartmentId()
                            );
                })
                .map(this::toPeerDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PeerSkillDTO> getPeerSkills(Long employeeId) {

        Employee currentEmployee = getLoggedInEmployee();

        validateNotSelf(employeeId, currentEmployee);

        Employee peer = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Peer employee not found.")
                );

        return employeeSkillRepository
                .findByEmployee(peer)
                .stream()
                .map(skill -> new PeerSkillDTO(
                        skill.getSkill().getSkillId(),
                        skill.getSkill().getSkillName(),
                       skill.getSkill().getSkillCategory() != null
                       ? skill.getSkill().getSkillCategory().name()
                       : null,
                       skill.getProficiencyLevel() != null
                                ? skill.getProficiencyLevel().name()
                                : null
                ))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PeerAssessmentDTO getPeerAssessment(
            Long employeeId,
            Long skillId
    ) {

        Employee currentEmployee = getLoggedInEmployee();

        validateNotSelf(employeeId, currentEmployee);

        Employee peer = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found.")
                );

        EmployeeSkill employeeSkill =
                employeeSkillRepository
                        .findByEmployee(peer)
                        .stream()
                        .filter(es ->
                                es.getSkill()
                                        .getSkillId()
                                        .equals(skillId))
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Selected employee does not have this skill."
                                )
                        );

        Assessment assessment =
                assessmentRepository
                        .findBySkillSkillIdAndAssessmentTypeAndActiveTrue(
                                skillId,
                                Assessment.AssessmentType.PEER
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Peer assessment is not available for this skill."
                                )
                        );

        List<AssessmentQuestion> questions =
                questionRepository
                        .findByAssessmentAssessmentIdOrderByQuestionOrderAsc(
                                assessment.getAssessmentId()
                        );

        List<PeerQuestionDTO> questionDTOs =
                questions.stream()
                        .filter(q ->
                                q.getQuestionType()
                                        == AssessmentQuestion.QuestionType.RATING)
                        .map(q -> new PeerQuestionDTO(
                                q.getQuestionId(),
                                q.getQuestionType().name(),
                                q.getQuestionText(),
                                q.getMarks(),
                                q.getQuestionOrder()
                        ))
                        .collect(Collectors.toList());

        PeerAssessmentDTO dto = new PeerAssessmentDTO();

        dto.setAssessmentId(assessment.getAssessmentId());
        dto.setEmployeeId(peer.getEmployeeId());

        dto.setEmployeeName(
                peer.getFirstName() + " " + peer.getLastName()
        );

        dto.setSkillId(employeeSkill.getSkill().getSkillId());
        dto.setSkillName(employeeSkill.getSkill().getSkillName());

        dto.setAssessmentName(assessment.getAssessmentName());

        int totalMarks = questionDTOs.stream()
                .mapToInt(PeerQuestionDTO::getMarks)
                .sum();

        dto.setTotalMarks(totalMarks);
        dto.setQuestions(questionDTOs);

        return dto;
    }

    @Override
    public PeerAssessmentResultDTO startAssessment(
            Long employeeId,
            Long skillId
    ) {

        Employee evaluator = getLoggedInEmployee();

        validateNotSelf(employeeId, evaluator);

        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found.")
                );

        EmployeeSkill employeeSkill =
                employeeSkillRepository
                        .findByEmployeeAndSkill(
                                employee,
                                findSkill(skillId)
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Selected employee does not have this skill."
                                )
                        );

        Assessment assessment =
                assessmentRepository
                        .findBySkillSkillIdAndAssessmentTypeAndActiveTrue(
                                skillId,
                                Assessment.AssessmentType.PEER
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Peer assessment is not available."
                                )
                        );

        boolean alreadySubmitted =
                attemptRepository
                        .existsByAssessmentAssessmentIdAndEmployeeEmployeeIdAndEvaluatorEmployeeIdAndStatus(
                                assessment.getAssessmentId(),
                                employeeId,
                                evaluator.getEmployeeId(),
                                AssessmentAttempt.Status.SUBMITTED
                        );

        if (alreadySubmitted) {
            throw new RuntimeException(
                    "You have already completed this peer assessment."
            );
        }

        AssessmentAttempt attempt = new AssessmentAttempt();

        attempt.setEmployee(employee);
        attempt.setEvaluator(evaluator);
        attempt.setAssessment(assessment);
        attempt.setStatus(AssessmentAttempt.Status.IN_PROGRESS);
        attempt.setScore(0);
        attempt.setPercentage(0.0);
        attempt.setStartedAt(LocalDateTime.now());

        AssessmentAttempt saved =
                attemptRepository.save(attempt);

        return toResultDTO(saved);
    }

    @Override
    public PeerAssessmentResultDTO submitAssessment(
            Long attemptId,
            List<PeerAnswerRequestDTO> answers
    ) {

        Employee evaluator = getLoggedInEmployee();

        AssessmentAttempt attempt =
                attemptRepository
                        .findByAttemptIdAndEvaluatorEmployeeId(
                                attemptId,
                                evaluator.getEmployeeId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assessment attempt not found."
                                )
                        );

        if (attempt.getStatus()
                == AssessmentAttempt.Status.SUBMITTED) {

            throw new RuntimeException(
                    "This assessment has already been submitted."
            );
        }

        if (answers == null || answers.isEmpty()) {
            throw new RuntimeException(
                    "Please provide ratings before submitting."
            );
        }

        List<AssessmentQuestion> questions =
                questionRepository
                        .findByAssessmentAssessmentIdOrderByQuestionOrderAsc(
                                attempt.getAssessment()
                                        .getAssessmentId()
                        );

        Map<Long, PeerAnswerRequestDTO> answerMap =
                answers.stream()
                        .collect(Collectors.toMap(
                                PeerAnswerRequestDTO::getQuestionId,
                                a -> a,
                                (a, b) -> b
                        ));

        int totalScore = 0;
        int totalMarks = 0;

        for (AssessmentQuestion question : questions) {

            if (question.getQuestionType()
                    != AssessmentQuestion.QuestionType.RATING) {
                continue;
            }

            PeerAnswerRequestDTO request =
                    answerMap.get(question.getQuestionId());

            if (request == null) {
                throw new RuntimeException(
                        "Please answer all peer assessment questions."
                );
            }

            Integer rating = request.getRating();

            if (rating == null || rating < 1 || rating > 5) {
                throw new RuntimeException(
                        "Rating must be between 1 and 5."
                );
            }

            AssessmentAnswer answer =
                    new AssessmentAnswer();

            answer.setAttempt(attempt);
            answer.setQuestion(question);
            answer.setRating(rating);

            /*
             * Rating itself becomes the marks awarded.
             *
             * Example:
             * rating 4 → 4 marks
             */
            answer.setMarksAwarded(rating);

            answerRepository.save(answer);

            totalScore += rating;
            totalMarks += question.getMarks();
        }

        if (totalMarks == 0) {
            throw new RuntimeException(
                    "No peer assessment questions are configured."
            );
        }

        double percentage =
                ((double) totalScore / totalMarks) * 100.0;

        attempt.setScore(totalScore);
        attempt.setPercentage(
                Math.round(percentage * 100.0) / 100.0
        );
        attempt.setStatus(
                AssessmentAttempt.Status.SUBMITTED
        );
        attempt.setSubmittedAt(LocalDateTime.now());

        AssessmentAttempt saved =
                attemptRepository.save(attempt);

        return toResultDTO(saved);
    }

    private Employee getLoggedInEmployee() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated."
            );
        }

        return employeeRepository
                .findByOfficialEmail(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in employee not found."
                        )
                );
    }

    private void validateNotSelf(
            Long employeeId,
            Employee currentEmployee
    ) {

        if (employeeId == null
                || employeeId.equals(
                        currentEmployee.getEmployeeId())) {

            throw new RuntimeException(
                    "You cannot perform a peer assessment for yourself."
            );
        }
    }

   private com.okip.entity.master.Skill findSkill(Long skillId) {

    return skillRepository.findById(skillId)
            .orElseThrow(() ->
                    new RuntimeException("Skill not found.")
            );
}
    private PeerDTO toPeerDTO(Employee employee) {

        String department =
                employee.getDepartment() != null
                    && employee.getDepartment().getDepartmentName() != null
                    ? employee.getDepartment()
                            .getDepartmentName()
                    : null;

        String role =
                 employee.getRole() != null
                    && employee.getRole().getRoleName() != null
                    ? employee.getRole()
                            .getRoleName()
                            .name()
                    : null;


        return new PeerDTO(
                employee.getEmployeeId(),
                employee.getEmployeeCode(),
                employee.getFirstName()
                        + " "
                        + employee.getLastName(),
                employee.getOfficialEmail(),
                department,
                role
        );
    }

    private PeerAssessmentResultDTO toResultDTO(
            AssessmentAttempt attempt
    ) {

        PeerAssessmentResultDTO dto =
                new PeerAssessmentResultDTO();

        dto.setAttemptId(attempt.getAttemptId());

        dto.setAssessmentId(
                attempt.getAssessment()
                        .getAssessmentId()
        );

        dto.setEmployeeId(
                attempt.getEmployee()
                        .getEmployeeId()
        );

        dto.setEmployeeName(
                attempt.getEmployee().getFirstName()
                        + " "
                        + attempt.getEmployee().getLastName()
        );

        dto.setSkillId(
                attempt.getAssessment()
                        .getSkill()
                        .getSkillId()
        );

        dto.setSkillName(
                attempt.getAssessment()
                        .getSkill()
                        .getSkillName()
        );

        dto.setScore(attempt.getScore());

        List<AssessmentQuestion> questions =
                questionRepository
                        .findByAssessmentAssessmentIdOrderByQuestionOrderAsc(
                                attempt.getAssessment()
                                        .getAssessmentId()
                        );

        int totalMarks = questions.stream()
                .filter(q ->
                        q.getQuestionType()
                                == AssessmentQuestion.QuestionType.RATING)
                .mapToInt(AssessmentQuestion::getMarks)
                .sum();

        dto.setTotalMarks(totalMarks);
        dto.setPercentage(attempt.getPercentage());
        dto.setStatus(attempt.getStatus().name());

        return dto;
    }
}