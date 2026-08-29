package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.employee.AchievementResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.dto.employee.CertificationRequest;
import com.orgskills.intelligence.dto.employee.CertificationResponse;
import com.orgskills.intelligence.dto.employee.EmployeeProfileRequest;
import com.orgskills.intelligence.dto.employee.EmployeeProfileResponse;
import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.dto.employee.MentorMatchResponse;
import com.orgskills.intelligence.entity.Achievement;
import com.orgskills.intelligence.entity.Certification;
import com.orgskills.intelligence.entity.EmployeeProfile;
import com.orgskills.intelligence.entity.MentorshipMatch;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AchievementType;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.CertificationStatus;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AchievementRepository;
import com.orgskills.intelligence.repository.CertificationRepository;
import com.orgskills.intelligence.repository.EmployeeProfileRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final AchievementRepository achievementRepository;
    private final CertificationRepository certificationRepository;
    private final MentorshipMatchRepository mentorshipMatchRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final TrainingProgressService trainingProgressService;
    private final AssessmentService assessmentService;

    // ── Profile CRUD ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public EmployeeProfileResponse getProfile(Long userId) {
        User user = getUser(userId);
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
                .orElseGet(() -> createEmptyProfile(user));
        return toProfileResponse(profile);
    }

    @Transactional
    public EmployeeProfileResponse updateProfile(Long userId, EmployeeProfileRequest request) {
        User user = getUser(userId);
        EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    EmployeeProfile p = new EmployeeProfile();
                    p.setUser(user);
                    return p;
                });

        profile.setBio(request.getBio());
        profile.setDepartment(request.getDepartment());
        profile.setJobRole(request.getJobRole());
        profile.setWorkExperience(request.getWorkExperience());
        profile.setEducation(request.getEducation());

        EmployeeProfile saved = employeeProfileRepository.save(profile);
        auditLogService.logEvent(userId, user.getEmail(), "UPDATE_EMPLOYEE_PROFILE", "EmployeeProfile", saved.getId().toString(), "Employee profile updated");
        return toProfileResponse(saved);
    }

    // ── Self & Peer Assessment ──────────────────────────────────────────────────

    // Assessment submission and the chain it triggers live in AssessmentService, so these
    // self-service endpoints and /api/assessments run exactly the same flow.

    @Transactional
    public AssessmentResponse submitSelfAssessment(Long userId, SubmitAssessmentRequest request) {
        return assessmentService.createAndSubmit(userId, userId, AssessmentType.SELF, request);
    }

    @Transactional
    public AssessmentResponse submitPeerAssessment(Long submitterId, Long colleagueId, SubmitAssessmentRequest request) {
        return assessmentService.createAndSubmit(submitterId, colleagueId, AssessmentType.PEER, request);
    }

    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAssessmentsReceived(Long userId) {
        return assessmentService.getAssessments(userId, userId);
    }

    @Transactional(readOnly = true)
    public List<AssessmentResponse> getAssessmentsGiven(Long userId) {
        return assessmentService.getAssessmentsByAssessor(userId);
    }

    // ── Training Enrollment & Progress ──────────────────────────────────────────

    // Enrolment, progress and the completion chain live in TrainingProgressService so that the
    // self-service endpoints below and /api/enrollments share one implementation.

    @Transactional
    public EnrollmentResponse enrollCourse(Long userId, Long courseId) {
        return trainingProgressService.enroll(userId, new EnrollmentRequest(courseId));
    }

    @Transactional
    public EnrollmentResponse updateProgress(Long userId, Long enrollmentId, Double progress) {
        return trainingProgressService.updateProgress(userId, enrollmentId, new UpdateProgressRequest(progress));
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollments(Long userId) {
        return trainingProgressService.getEnrollments(userId, userId);
    }

    // ── Achievements & Certifications ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<AchievementResponse> getAchievements(Long userId) {
        return achievementRepository.findByEmployeeIdOrderByEarnedAtDesc(userId).stream()
                .map(this::toAchievementResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CertificationResponse> getCertifications(Long userId) {
        return certificationRepository.findByEmployeeId(userId).stream()
                .map(this::toCertificationResponse)
                .toList();
    }

    @Transactional
    public CertificationResponse addCertification(Long userId, CertificationRequest request) {
        User employee = getUser(userId);

        Certification certification = new Certification();
        certification.setEmployee(employee);
        certification.setName(request.getName());
        certification.setIssuer(request.getIssuer());
        certification.setIssuedAt(request.getIssuedAt());
        certification.setExpiresAt(request.getExpiresAt());

        if (request.getExpiresAt() != null && request.getExpiresAt().isBefore(LocalDate.now().plusDays(30))) {
            certification.setStatus(CertificationStatus.EXPIRING_SOON);
        } else {
            certification.setStatus(CertificationStatus.ACTIVE);
        }

        Certification saved = certificationRepository.save(certification);

        // Auto-generate achievement for certification earned
        Achievement achievement = new Achievement();
        achievement.setEmployee(employee);
        achievement.setType(AchievementType.CERTIFICATION_EARNED);
        achievement.setTitle("Certification Earned: " + saved.getName());
        achievement.setDescription("Earned certification issued by " + saved.getIssuer());
        achievementRepository.save(achievement);

        auditLogService.logEvent(userId, employee.getEmail(), "ADD_CERTIFICATION", "Certification", saved.getId().toString(), "Added certification: " + saved.getName());
        return toCertificationResponse(saved);
    }

    // ── Mentorship ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<MentorMatchResponse> getAvailableMentors(Long userId, Long skillId) {
        List<UserSkill> highlyProficient = userSkillRepository.findBySkillId(skillId).stream()
                .filter(us -> !us.getUser().getId().equals(userId))
                .filter(us -> us.getProficiencyLevel().getScore() >= ProficiencyLevel.ADVANCED.getScore())
                .toList();

        return highlyProficient.stream().map(us -> MentorMatchResponse.builder()
                .mentorId(us.getUser().getId())
                .mentorName(us.getUser().getFullName())
                .mentorEmail(us.getUser().getEmail())
                .department(us.getUser().getDepartment())
                .jobTitle(us.getUser().getJobTitle())
                .skillId(us.getSkill().getId())
                .skillName(us.getSkill().getName())
                .proficiencyLevel(us.getProficiencyLevel())
                .ratingScore(us.getRatingScore())
                .build()).toList();
    }

    @Transactional
    public MentorshipMatch requestMentorship(Long menteeId, Long mentorId, Long targetSkillId) {
        if (menteeId.equals(mentorId)) {
            throw new ValidationException("Cannot request mentorship with yourself");
        }

        User mentee = getUser(menteeId);
        User mentor = getUser(mentorId);
        Skill targetSkill = getSkill(targetSkillId);

        MentorshipMatch match = new MentorshipMatch();
        match.setMentee(mentee);
        match.setMentor(mentor);
        match.setTargetSkill(targetSkill);
        match.setStatus(MentorshipStatus.REQUESTED);

        MentorshipMatch saved = mentorshipMatchRepository.save(match);

        notificationService.createNotification(
                mentor,
                "Mentorship Request",
                mentee.getFullName() + " has requested your mentorship for " + targetSkill.getName(),
                NotificationType.MENTORSHIP_REQUEST
        );

        return saved;
    }

    @Transactional
    public MentorshipMatch acceptMentorship(Long mentorId, Long matchId) {
        MentorshipMatch match = mentorshipMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship match not found for id: " + matchId));

        if (!match.getMentor().getId().equals(mentorId)) {
            throw new ValidationException("Access denied. You are not the assigned mentor.");
        }

        match.setStatus(MentorshipStatus.ACTIVE);
        MentorshipMatch saved = mentorshipMatchRepository.save(match);

        notificationService.createNotification(
                match.getMentee(),
                "Mentorship Request Accepted",
                match.getMentor().getFullName() + " accepted your mentorship request for " + match.getTargetSkill().getName(),
                NotificationType.INFO
        );

        return saved;
    }

    @Transactional
    public MentorshipMatch completeMentorship(Long userId, Long matchId) {
        MentorshipMatch match = mentorshipMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentorship match not found for id: " + matchId));

        if (!match.getMentee().getId().equals(userId) && !match.getMentor().getId().equals(userId)) {
            throw new ValidationException("Access denied. You are not a participant in this mentorship.");
        }

        match.setStatus(MentorshipStatus.COMPLETED);
        MentorshipMatch saved = mentorshipMatchRepository.save(match);

        Achievement achievement = new Achievement();
        achievement.setEmployee(match.getMentee());
        achievement.setType(AchievementType.MENTORSHIP_COMPLETED);
        achievement.setTitle("Mentorship Completed: " + match.getTargetSkill().getName());
        achievement.setDescription("Completed mentorship with " + match.getMentor().getFullName());
        achievementRepository.save(achievement);

        return saved;
    }

    // ── Helper methods ──────────────────────────────────────────────────────────

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }

    private Skill getSkill(Long skillId) {
        return skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + skillId));
    }

    private EmployeeProfile createEmptyProfile(User user) {
        EmployeeProfile profile = new EmployeeProfile();
        profile.setUser(user);
        profile.setDepartment(user.getDepartment());
        profile.setJobRole(user.getJobTitle());
        return employeeProfileRepository.save(profile);
    }



    private EmployeeProfileResponse toProfileResponse(EmployeeProfile profile) {
        return EmployeeProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .userFullName(profile.getUser().getFullName())
                .userEmail(profile.getUser().getEmail())
                .bio(profile.getBio())
                .department(profile.getDepartment() != null ? profile.getDepartment() : profile.getUser().getDepartment())
                .jobRole(profile.getJobRole() != null ? profile.getJobRole() : profile.getUser().getJobTitle())
                .workExperience(profile.getWorkExperience())
                .education(profile.getEducation())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }



    private AchievementResponse toAchievementResponse(Achievement a) {
        return AchievementResponse.builder()
                .id(a.getId())
                .employeeId(a.getEmployee().getId())
                .type(a.getType())
                .title(a.getTitle())
                .description(a.getDescription())
                .earnedAt(a.getEarnedAt())
                .build();
    }

    private CertificationResponse toCertificationResponse(Certification c) {
        return CertificationResponse.builder()
                .id(c.getId())
                .employeeId(c.getEmployee().getId())
                .employeeName(c.getEmployee().getFullName())
                .name(c.getName())
                .issuer(c.getIssuer())
                .issuedAt(c.getIssuedAt())
                .expiresAt(c.getExpiresAt())
                .status(c.getStatus())
                .build();
    }
}
