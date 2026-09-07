package com.okip.service.assessment.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.assessment.AssessmentReviewRequestDTO;
import com.okip.dto.assessment.SkillAssessmentRequestDTO;
import com.okip.dto.assessment.SkillAssessmentResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.EmployeeSkill;
import com.okip.entity.transaction.SkillAssessment;
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

@Service
public class SkillAssessmentServiceImpl implements SkillAssessmentService {

    private final SkillAssessmentRepository assessmentRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final GapAnalysisService gapAnalysisService;
    private final NotificationService notificationService;

    public SkillAssessmentServiceImpl(
            SkillAssessmentRepository assessmentRepository,
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository,
            EmployeeSkillRepository employeeSkillRepository,
            GapAnalysisService gapAnalysisService,
            NotificationService notificationService) {
        this.assessmentRepository = assessmentRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.gapAnalysisService = gapAnalysisService;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public SkillAssessmentResponseDTO submitAssessment(SkillAssessmentRequestDTO request) {
        Employee evaluator = getLoggedInEmployee();
        Employee employee;

        if (request.getEmployeeId() != null && !request.getEmployeeId().equals(evaluator.getEmployeeId())) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target employee not found."));
        } else {
            employee = evaluator;
        }

        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found."));

        AssessmentType aType;
        try {
            aType = AssessmentType.valueOf(request.getAssessmentType().toUpperCase());
        } catch (Exception e) {
            aType = employee.getEmployeeId().equals(evaluator.getEmployeeId()) ? AssessmentType.SELF : AssessmentType.PEER;
        }

        ProficiencyLevel pLevel;
        try {
            pLevel = ProficiencyLevel.valueOf(request.getAssessedProficiency().toUpperCase());
        } catch (Exception e) {
            throw new BadRequestException("Invalid proficiency level: " + request.getAssessedProficiency());
        }

        SkillAssessment assessment = new SkillAssessment();
        assessment.setEmployee(employee);
        assessment.setEvaluator(evaluator);
        assessment.setSkill(skill);
        assessment.setAssessmentType(aType);
        assessment.setAssessedProficiency(pLevel);
        assessment.setScore(request.getScore() != null ? request.getScore() : 80);
        assessment.setComments(request.getComments());

        // If a Manager submits an assessment for their report, it can be immediately APPROVED or PENDING_REVIEW
        boolean isManager = evaluator.getRole() != null &&
                (evaluator.getRole().getRoleName().name().equals("ROLE_MANAGER") || evaluator.getRole().getRoleName().name().equals("ROLE_ADMIN"));

        if (aType == AssessmentType.MANAGER && isManager) {
            assessment.setStatus(AssessmentStatus.APPROVED);
            assessment.setReviewer(evaluator);
            assessment.setReviewedAt(LocalDateTime.now());
            assessment.setReviewerComments("Direct manager assessment approved.");
        } else {
            assessment.setStatus(AssessmentStatus.PENDING_REVIEW);
        }

        SkillAssessment saved = assessmentRepository.save(assessment);

        // If approved directly, update skills and recalculate gaps immediately
        if (saved.getStatus() == AssessmentStatus.APPROVED) {
            applyApprovedAssessment(saved, pLevel);
        } else {
            // Notify employee or evaluator that assessment is pending review
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
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
        return assessmentRepository.findByEmployeeOrderByCreatedAtDesc(employee)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public SkillAssessmentResponseDTO getAssessmentById(Long assessmentId) {
        SkillAssessment a = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found."));
        return convertToDTO(a);
    }

    @Override
    @Transactional
    public SkillAssessmentResponseDTO reviewAssessment(Long assessmentId, AssessmentReviewRequestDTO reviewRequest) {
        Employee reviewer = getLoggedInEmployee();
        SkillAssessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found."));

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
        employeeSkillRepository.save(employeeSkill);

        // Automated recalculation of knowledge gaps!
        try {
            gapAnalysisService.runGapAnalysis(employee.getEmployeeId());
        } catch (Exception e) {
            // Log or ignore if employee has no job role assigned yet
        }
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
}
