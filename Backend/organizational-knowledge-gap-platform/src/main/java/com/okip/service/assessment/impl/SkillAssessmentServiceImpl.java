package com.okip.service.assessment.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.assessment.AssessmentReviewRequestDTO;
import com.okip.dto.assessment.PeerTargetDTO;
import com.okip.dto.assessment.SkillAssessmentRequestDTO;
import com.okip.dto.assessment.SkillAssessmentResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.SkillAssessment;
import com.okip.enums.AccountStatus;
import com.okip.enums.AssessmentStatus;
import com.okip.enums.AssessmentType;
import com.okip.enums.NotificationType;
import com.okip.enums.ProficiencyLevel;
import com.okip.exception.BadRequestException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.SkillAssessmentRepository;
import com.okip.repository.SkillRepository;
import com.okip.service.assessment.SkillAssessmentService;
import com.okip.service.gap.GapAnalysisService;
import com.okip.service.notification.NotificationService;

import com.okip.dto.assessment.QuizDTO;
import com.okip.service.quiz.QuizBankService;
import com.okip.service.quiz.QuizBankService.QuizEvaluationResult;

@Service
public class SkillAssessmentServiceImpl implements SkillAssessmentService {

    private final SkillAssessmentRepository assessmentRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final GapAnalysisService gapAnalysisService;
    private final NotificationService notificationService;
    private final QuizBankService quizBankService;

    public SkillAssessmentServiceImpl(
            SkillAssessmentRepository assessmentRepository,
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository,
            EmployeeSkillRepository employeeSkillRepository,
            GapAnalysisService gapAnalysisService,
            NotificationService notificationService,
            QuizBankService quizBankService) {
        this.assessmentRepository = assessmentRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.gapAnalysisService = gapAnalysisService;
        this.notificationService = notificationService;
        this.quizBankService = quizBankService;
    }

    @Override
    @Transactional
    public SkillAssessmentResponseDTO submitAssessment(SkillAssessmentRequestDTO request) {
        Employee evaluator = getLoggedInEmployee();
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found."));

        AssessmentType aType;
        try {
            aType = AssessmentType.valueOf(request.getAssessmentType().toUpperCase());
        } catch (Exception e) {
            aType = (request.getEmployeeId() == null || request.getEmployeeId().equals(evaluator.getEmployeeId()))
                    ? AssessmentType.SELF : AssessmentType.PEER;
        }

        Employee employee;
        if (aType == AssessmentType.SELF) {
            employee = evaluator; // For SELF assessment, always force target employee to be the logged-in evaluator
        } else {
            if (request.getEmployeeId() != null && !request.getEmployeeId().equals(evaluator.getEmployeeId())) {
                employee = employeeRepository.findById(request.getEmployeeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Target employee not found."));
            } else {
                if (aType == AssessmentType.PEER) {
                    throw new BadRequestException("Peer assessment requires selecting a valid target peer employee.");
                }
                employee = evaluator;
            }
        }

        String evaluatorRole = evaluator.getRole() != null ? evaluator.getRole().getRoleName().name() : "";

        if (aType == AssessmentType.MANAGER) {
            if (evaluatorRole.equals("ROLE_EMPLOYEE")) {
                throw new org.springframework.security.access.AccessDeniedException("Employees are not authorized to submit manager assessments.");
            }
            if (evaluatorRole.equals("ROLE_MANAGER")) {
                boolean sameDept = evaluator.getDepartment() != null && employee.getDepartment() != null &&
                        evaluator.getDepartment().getDepartmentId().equals(employee.getDepartment().getDepartmentId());
                if (!sameDept && !evaluator.getEmployeeId().equals(employee.getEmployeeId())) {
                    throw new org.springframework.security.access.AccessDeniedException("Managers can only submit assessments for employees in their department.");
                }
            }
        }

        ProficiencyLevel pLevel;
        int calculatedScore;

        if (aType == AssessmentType.SELF) {
            String catStr = skill.getSkillCategory() != null ? skill.getSkillCategory().name() : null;
            QuizEvaluationResult evalResult = quizBankService.evaluateAnswers(
                    evaluator.getEmployeeId(), skill.getSkillId(), skill.getSkillName(), catStr, request.getQuizAnswers());
            calculatedScore = evalResult.getScore();
            pLevel = ProficiencyLevel.valueOf(evalResult.getProficiency());
        } else {
            if (request.getScore() == null) {
                throw new BadRequestException("Assessment score is required.");
            }
            calculatedScore = request.getScore();
            try {
                pLevel = ProficiencyLevel.valueOf(request.getAssessedProficiency().toUpperCase());
            } catch (Exception e) {
                throw new BadRequestException("Invalid proficiency level: " + request.getAssessedProficiency());
            }
        }

        SkillAssessment assessment = new SkillAssessment();
        assessment.setEmployee(employee);
        assessment.setEvaluator(evaluator);
        assessment.setSkill(skill);
        assessment.setAssessmentType(aType);
        assessment.setAssessedProficiency(pLevel);
        assessment.setScore(calculatedScore);
        assessment.setComments(request.getComments() != null ? request.getComments() : "Assessment submitted.");

        boolean isAuthorizedManagerOrAdmin = evaluatorRole.equals("ROLE_MANAGER") || evaluatorRole.equals("ROLE_ADMIN");

        if (aType == AssessmentType.MANAGER && isAuthorizedManagerOrAdmin) {
            assessment.setStatus(AssessmentStatus.APPROVED);
            assessment.setReviewer(evaluator);
            assessment.setReviewedAt(LocalDateTime.now());
            assessment.setReviewerComments("Direct manager assessment approved.");
        } else {
            assessment.setStatus(AssessmentStatus.PENDING_REVIEW);
        }

        SkillAssessment saved = assessmentRepository.save(assessment);

        if (saved.getStatus() == AssessmentStatus.APPROVED) {
            applyApprovedAssessment(saved, pLevel);
        } else {
            notificationService.createNotification(
                    employee,
                    "New Skill Assessment Submitted",
                    "A " + aType.name() + " assessment for " + skill.getSkillName() + " has been submitted and is pending review.",
                    NotificationType.ASSESSMENT,
                    saved.getAssessmentId()
            );
        }

        return convertToDTO(saved);
    }

    @Override
    public List<SkillAssessmentResponseDTO> getMyAssessments() {
        Employee employee = getLoggedInEmployee();
        return assessmentRepository.findByEmployeeOrderByCreatedAtDesc(employee)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SkillAssessmentResponseDTO> getPendingReviews() {
        Employee loggedIn = getLoggedInEmployee();
        return assessmentRepository.findPendingForManagerOrPeer(AssessmentStatus.PENDING_REVIEW, loggedIn, loggedIn.getDepartment())
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<SkillAssessmentResponseDTO> getEmployeeAssessments(Long employeeId) {
        Employee loggedIn = getLoggedInEmployee();
        String role = loggedIn.getRole() != null ? loggedIn.getRole().getRoleName().name() : "";

        if (!loggedIn.getEmployeeId().equals(employeeId)) {
            if (role.equals("ROLE_EMPLOYEE")) {
                throw new org.springframework.security.access.AccessDeniedException("You are not authorized to view assessments for this employee.");
            }
            if (role.equals("ROLE_MANAGER")) {
                Employee targetEmp = employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
                boolean sameDept = loggedIn.getDepartment() != null && targetEmp.getDepartment() != null &&
                        loggedIn.getDepartment().getDepartmentId().equals(targetEmp.getDepartment().getDepartmentId());
                if (!sameDept) {
                    throw new org.springframework.security.access.AccessDeniedException("Managers can only view assessments for employees in their department.");
                }
            }
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        return assessmentRepository.findByEmployeeOrderByCreatedAtDesc(employee)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public SkillAssessmentResponseDTO getAssessmentById(Long assessmentId) {
        Employee loggedIn = getLoggedInEmployee();
        SkillAssessment a = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found."));

        boolean isSelf = a.getEmployee().getEmployeeId().equals(loggedIn.getEmployeeId());
        boolean isEvaluator = a.getEvaluator().getEmployeeId().equals(loggedIn.getEmployeeId());

        String role = loggedIn.getRole() != null ? loggedIn.getRole().getRoleName().name() : "";

        if (!isSelf && !isEvaluator) {
            if (role.equals("ROLE_EMPLOYEE")) {
                throw new org.springframework.security.access.AccessDeniedException("You are not authorized to view this assessment.");
            }
            if (role.equals("ROLE_MANAGER")) {
                boolean sameDept = loggedIn.getDepartment() != null && a.getEmployee().getDepartment() != null &&
                        loggedIn.getDepartment().getDepartmentId().equals(a.getEmployee().getDepartment().getDepartmentId());
                if (!sameDept) {
                    throw new org.springframework.security.access.AccessDeniedException("Managers can only view assessments for employees in their department.");
                }
            }
        }

        return convertToDTO(a);
    }

    @Override
    @Transactional
    public SkillAssessmentResponseDTO reviewAssessment(Long assessmentId, AssessmentReviewRequestDTO reviewRequest) {
        Employee reviewer = getLoggedInEmployee();
        SkillAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found."));

        if (assessment.getEmployee().getEmployeeId().equals(reviewer.getEmployeeId())) {
            throw new org.springframework.security.access.AccessDeniedException("You cannot review or approve your own assessment.");
        }

        AssessmentStatus targetStatus;
        try {
            targetStatus = AssessmentStatus.valueOf(reviewRequest.getStatus().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid status: " + reviewRequest.getStatus());
        }

        ProficiencyLevel finalProficiency = assessment.getAssessedProficiency();
        if (reviewRequest.getOverrideProficiency() != null && !reviewRequest.getOverrideProficiency().isBlank()) {
            try {
                finalProficiency = ProficiencyLevel.valueOf(reviewRequest.getOverrideProficiency().toUpperCase());
                assessment.setAssessedProficiency(finalProficiency);
            } catch (Exception e) {
                // Ignore invalid override and keep original
            }
        }

        assessment.setStatus(targetStatus);
        assessment.setReviewer(reviewer);
        assessment.setReviewerComments(reviewRequest.getReviewerComments());
        assessment.setReviewedAt(LocalDateTime.now());

        SkillAssessment updated = assessmentRepository.save(assessment);

        if (targetStatus == AssessmentStatus.APPROVED) {
            applyApprovedAssessment(updated, finalProficiency);

            notificationService.createNotification(
                    assessment.getEmployee(),
                    "Assessment Approved & Gaps Recalculated!",
                    "Your " + assessment.getSkill().getSkillName() + " assessment was approved at " + finalProficiency.name() + " level. Knowledge gaps have been updated.",
                    NotificationType.ASSESSMENT,
                    updated.getAssessmentId()
            );
        } else if (targetStatus == AssessmentStatus.REJECTED) {
            notificationService.createNotification(
                    assessment.getEmployee(),
                    "Assessment Status Update",
                    "Your " + assessment.getSkill().getSkillName() + " assessment was not approved. Feedback: " + (reviewRequest.getReviewerComments() != null ? reviewRequest.getReviewerComments() : "None provided"),
                    NotificationType.ASSESSMENT,
                    updated.getAssessmentId()
            );
        }

        return convertToDTO(updated);
    }

    private void applyApprovedAssessment(SkillAssessment assessment, ProficiencyLevel finalProficiency) {
        Employee employee = assessment.getEmployee();
        Skill skill = assessment.getSkill();

        EmployeeSkill employeeSkill = employeeSkillRepository.findByEmployeeAndSkill(employee, skill)
                .orElseGet(() -> {
                    EmployeeSkill es = new EmployeeSkill();
                    es.setEmployee(employee);
                    es.setSkill(skill);
                    es.setYearsOfExperience(1.0);
                    return es;
                });

        employeeSkill.setProficiencyLevel(finalProficiency);
        employeeSkill.setIsVerified(true);
        employeeSkillRepository.save(employeeSkill);

        // Automated recalculation of knowledge gaps!
        try {
            gapAnalysisService.runGapAnalysis(employee.getEmployeeId());
        } catch (Exception e) {
            // Log or ignore if employee has no job role assigned yet
        }
    }

    @Override
    public List<PeerTargetDTO> getPeerTargets() {
        Employee loggedIn = getLoggedInEmployee();
        return employeeRepository.findByStatus(AccountStatus.APPROVED)
                .stream()
                .filter(e -> !e.getEmployeeId().equals(loggedIn.getEmployeeId()))
                .map(e -> new PeerTargetDTO(
                        e.getEmployeeId(),
                        e.getFirstName() + " " + e.getLastName(),
                        e.getEmployeeCode()))
                .collect(Collectors.toList());
    }

    private Employee getLoggedInEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found."));
    }

    private SkillAssessmentResponseDTO convertToDTO(SkillAssessment a) {
        SkillAssessmentResponseDTO dto = new SkillAssessmentResponseDTO();
        dto.setAssessmentId(a.getAssessmentId());
        dto.setEmployeeId(a.getEmployee().getEmployeeId());
        dto.setEmployeeName(a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName());
        dto.setEmployeeCode(a.getEmployee().getEmployeeCode());
        dto.setEmployeeDepartment(a.getEmployee().getDepartment() != null ? a.getEmployee().getDepartment().getDepartmentName() : "N/A");

        dto.setEvaluatorId(a.getEvaluator().getEmployeeId());
        dto.setEvaluatorName(a.getEvaluator().getFirstName() + " " + a.getEvaluator().getLastName());

        dto.setSkillId(a.getSkill().getSkillId());
        dto.setSkillName(a.getSkill().getSkillName());

        dto.setAssessmentType(a.getAssessmentType().name());
        dto.setAssessedProficiency(a.getAssessedProficiency().name());
        dto.setScore(a.getScore());
        dto.setComments(a.getComments());
        dto.setStatus(a.getStatus().name());

        if (a.getReviewer() != null) {
            dto.setReviewerId(a.getReviewer().getEmployeeId());
            dto.setReviewerName(a.getReviewer().getFirstName() + " " + a.getReviewer().getLastName());
        }
        dto.setReviewerComments(a.getReviewerComments());
        dto.setReviewedAt(a.getReviewedAt());
        dto.setCreatedAt(a.getCreatedAt());

        return dto;
    }

    @Override
    public QuizDTO getQuizQuestions(Long skillId) {
        Employee loggedIn = getLoggedInEmployee();
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found."));
        String catStr = skill.getSkillCategory() != null ? skill.getSkillCategory().name() : null;
        return quizBankService.generateQuizForSkill(loggedIn.getEmployeeId(), skill.getSkillId(), skill.getSkillName(), catStr);
    }
}
