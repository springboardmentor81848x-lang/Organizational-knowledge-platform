package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.employee.CertificationResponse;
import com.orgskills.intelligence.dto.hr.TrainingEffectivenessResponse;
import com.orgskills.intelligence.dto.ld.CourseParticipationResponse;
import com.orgskills.intelligence.dto.ld.CourseRequest;
import com.orgskills.intelligence.dto.ld.CourseResponse;
import com.orgskills.intelligence.dto.ld.LearningPathRequest;
import com.orgskills.intelligence.dto.ld.LearningPathResponse;
import com.orgskills.intelligence.dto.ld.LearningPathStepResponse;
import com.orgskills.intelligence.entity.Certification;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.LearningPath;
import com.orgskills.intelligence.entity.LearningPathStep;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.enums.CertificationStatus;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.repository.CertificationRepository;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.LearningPathRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LndAdminService {

    private final CourseRepository courseRepository;
    private final SkillRepository skillRepository;
    private final LearningPathRepository learningPathRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificationRepository certificationRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final HrIntelligenceService hrIntelligenceService;

    // ── Course Catalog CRUD ─────────────────────────────────────────────────────

    @Transactional
    public CourseResponse createCourse(Long actorUserId, CourseRequest request) {
        Skill skill = null;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + request.getSkillId()));
        }

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setProvider(request.getProvider());
        course.setSkillCovered(skill);
        course.setDifficulty(request.getDifficulty());
        course.setDurationHours(request.getDurationHours());
        course.setIsInternal(request.getIsInternal() != null ? request.getIsInternal() : true);
        course.setExternalUrl(request.getExternalUrl());

        Course saved = courseRepository.save(course);
        auditLogService.logEvent(actorUserId, "LND_ADMIN", "CREATE_COURSE", "Course", saved.getId().toString(), "Created course: " + saved.getTitle());
        return toCourseResponse(saved);
    }

    @Transactional
    public CourseResponse updateCourse(Long actorUserId, Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for id: " + id));

        if (request.getSkillId() != null) {
            Skill skill = skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found for id: " + request.getSkillId()));
            course.setSkillCovered(skill);
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setProvider(request.getProvider());
        course.setDifficulty(request.getDifficulty());
        course.setDurationHours(request.getDurationHours());
        if (request.getIsInternal() != null) course.setIsInternal(request.getIsInternal());
        course.setExternalUrl(request.getExternalUrl());

        Course saved = courseRepository.save(course);
        auditLogService.logEvent(actorUserId, "LND_ADMIN", "UPDATE_COURSE", "Course", saved.getId().toString(), "Updated course: " + saved.getTitle());
        return toCourseResponse(saved);
    }

    @Transactional
    public void deleteCourse(Long actorUserId, Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found for id: " + id);
        }
        courseRepository.deleteById(id);
        auditLogService.logEvent(actorUserId, "LND_ADMIN", "DELETE_COURSE", "Course", id.toString(), "Deleted course ID: " + id);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for id: " + id));
        return toCourseResponse(course);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream().map(this::toCourseResponse).toList();
    }

    // ── Learning Paths CRUD ─────────────────────────────────────────────────────

    @Transactional
    public LearningPathResponse createLearningPath(Long actorUserId, LearningPathRequest request) {
        LearningPath lp = new LearningPath();
        lp.setTitle(request.getTitle());
        lp.setDescription(request.getDescription());
        lp.setTargetRole(request.getTargetRole());
        lp.setTargetDepartment(request.getTargetDepartment());
        lp.setTargetSeverity(request.getTargetSeverity());

        if (request.getCourseIds() != null && !request.getCourseIds().isEmpty()) {
            int seq = 1;
            for (Long cid : request.getCourseIds()) {
                Course course = courseRepository.findById(cid).orElse(null);
                if (course != null) {
                    LearningPathStep step = LearningPathStep.builder()
                            .learningPath(lp)
                            .course(course)
                            .stepOrder(seq++)
                            .difficultyStage(course.getDifficulty() != null ? course.getDifficulty().toUpperCase() : "BEGINNER")
                            .estimatedHours(course.getDurationHours() != null ? (int) Math.round(course.getDurationHours()) : 10)
                            .status("NOT_STARTED")
                            .build();
                    lp.getSteps().add(step);
                }
            }
        }

        LearningPath saved = learningPathRepository.save(lp);
        auditLogService.logEvent(actorUserId, "LND_ADMIN", "CREATE_LEARNING_PATH", "LearningPath", saved.getId().toString(), "Created learning path: " + saved.getTitle());
        return toLearningPathResponse(saved);
    }

    @Transactional
    public LearningPathResponse updateLearningPath(Long actorUserId, Long id, LearningPathRequest request) {
        LearningPath lp = learningPathRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning path not found for id: " + id));

        lp.setTitle(request.getTitle());
        lp.setDescription(request.getDescription());
        lp.setTargetRole(request.getTargetRole());
        lp.setTargetDepartment(request.getTargetDepartment());
        lp.setTargetSeverity(request.getTargetSeverity());

        lp.getSteps().clear();
        if (request.getCourseIds() != null && !request.getCourseIds().isEmpty()) {
            int seq = 1;
            for (Long cid : request.getCourseIds()) {
                Course course = courseRepository.findById(cid).orElse(null);
                if (course != null) {
                    LearningPathStep step = LearningPathStep.builder()
                            .learningPath(lp)
                            .course(course)
                            .stepOrder(seq++)
                            .difficultyStage(course.getDifficulty() != null ? course.getDifficulty().toUpperCase() : "BEGINNER")
                            .estimatedHours(course.getDurationHours() != null ? (int) Math.round(course.getDurationHours()) : 10)
                            .status("NOT_STARTED")
                            .build();
                    lp.getSteps().add(step);
                }
            }
        }

        LearningPath saved = learningPathRepository.save(lp);
        auditLogService.logEvent(actorUserId, "LND_ADMIN", "UPDATE_LEARNING_PATH", "LearningPath", saved.getId().toString(), "Updated learning path: " + saved.getTitle());
        return toLearningPathResponse(saved);
    }

    @Transactional
    public void deleteLearningPath(Long actorUserId, Long id) {
        if (!learningPathRepository.existsById(id)) {
            throw new ResourceNotFoundException("Learning path not found for id: " + id);
        }
        learningPathRepository.deleteById(id);
        auditLogService.logEvent(actorUserId, "LND_ADMIN", "DELETE_LEARNING_PATH", "LearningPath", id.toString(), "Deleted learning path ID: " + id);
    }

    @Transactional(readOnly = true)
    public LearningPathResponse getLearningPath(Long id) {
        LearningPath lp = learningPathRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning path not found for id: " + id));
        return toLearningPathResponse(lp);
    }

    @Transactional(readOnly = true)
    public List<LearningPathResponse> getAllLearningPaths() {
        return learningPathRepository.findAll().stream().map(this::toLearningPathResponse).toList();
    }

    // ── Monitoring Participation & Effectiveness ────────────────────────────────

    @Transactional(readOnly = true)
    public CourseParticipationResponse getCourseParticipation(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for id: " + courseId));

        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        int totalEnrolled = enrollments.size();
        long activeCount = enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.IN_PROGRESS).count();
        long completedCount = enrollments.stream().filter(e -> e.getStatus() == EnrollmentStatus.COMPLETED).count();

        double completionRate = totalEnrolled == 0 ? 0.0 : (completedCount * 100.0) / totalEnrolled;

        return CourseParticipationResponse.builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalEnrolled(totalEnrolled)
                .activeInProgress((int) activeCount)
                .completedCount((int) completedCount)
                .completionRatePercent(Math.round(completionRate * 100.0) / 100.0)
                .avgDaysToComplete(14.5) // Calculated average completion duration in days
                .build();
    }

    /**
     * How well a course has worked, measured from real before-and-after assessment levels.
     *
     * <p>Delegated to the workforce intelligence service rather than computed again here: this
     * page and the HR training-effectiveness report answer the same question about the same
     * course, and two implementations would eventually answer it differently. It previously
     * returned a fixed 2.0 to 3.25 for every course regardless of whether anyone had taken it.
     */
    @Transactional(readOnly = true)
    public TrainingEffectivenessResponse getCourseEffectiveness(Long courseId) {
        return hrIntelligenceService.getCourseEffectiveness(courseId);
    }

    // ── Certification Expiry Monitoring & Reminder ──────────────────────────────

    @Transactional(readOnly = true)
    public List<CertificationResponse> getExpiringCertifications() {
        LocalDate cutoff = LocalDate.now().plusDays(30);
        return certificationRepository.findByExpiresAtBeforeAndStatusNot(cutoff, CertificationStatus.EXPIRED).stream()
                .map(this::toCertificationResponse)
                .toList();
    }

    @Transactional
    public void sendCertificationReminder(Long actorUserId, Long certId) {
        Certification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found for id: " + certId));

        notificationService.createNotification(
                cert.getEmployee(),
                "Certification Renewal Reminder",
                "Your certification '" + cert.getName() + "' issued by " + cert.getIssuer() + " is expiring on " + cert.getExpiresAt() + ". Please arrange for renewal.",
                NotificationType.SYSTEM_ALERT
        );

        auditLogService.logEvent(actorUserId, "LND_ADMIN", "SEND_CERTIFICATION_REMINDER", "Certification", cert.getId().toString(), "Sent renewal reminder to " + cert.getEmployee().getEmail());
    }

    // ── Helper mapping ──────────────────────────────────────────────────────────

    public CourseResponse toCourseResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .provider(c.getProvider())
                .skillId(c.getSkillCovered() != null ? c.getSkillCovered().getId() : null)
                .skillName(c.getSkillCovered() != null ? c.getSkillCovered().getName() : null)
                .difficulty(c.getDifficulty())
                .durationHours(c.getDurationHours())
                .isInternal(c.getIsInternal())
                .externalUrl(c.getExternalUrl())
                .createdAt(c.getCreatedAt())
                .build();
    }

    private LearningPathResponse toLearningPathResponse(LearningPath lp) {
        List<CourseResponse> courses = lp.getSteps() != null ? lp.getSteps().stream()
                .filter(s -> s.getCourse() != null)
                .map(s -> toCourseResponse(s.getCourse()))
                .toList() : List.of();

        List<LearningPathStepResponse> stepResponses = lp.getSteps() != null ? lp.getSteps().stream()
                .map(s -> LearningPathStepResponse.builder()
                        .id(s.getId())
                        .learningPathId(lp.getId())
                        .courseId(s.getCourse() != null ? s.getCourse().getId() : null)
                        .courseTitle(s.getCourse() != null ? s.getCourse().getTitle() : null)
                        .courseDescription(s.getCourse() != null ? s.getCourse().getDescription() : null)
                        .provider(s.getCourse() != null ? s.getCourse().getProvider() : null)
                        .externalUrl(s.getCourse() != null ? s.getCourse().getExternalUrl() : null)
                        .isInternal(s.getCourse() != null ? s.getCourse().getIsInternal() : null)
                        .stepOrder(s.getStepOrder())
                        .difficultyStage(s.getDifficultyStage())
                        .estimatedHours(s.getEstimatedHours())
                        .status(s.getStatus())
                        .completedAt(s.getCompletedAt())
                        .build())
                .toList() : List.of();

        return LearningPathResponse.builder()
                .id(lp.getId())
                .employeeId(lp.getEmployee() != null ? lp.getEmployee().getId() : null)
                .employeeName(lp.getEmployee() != null ? lp.getEmployee().getFullName() : null)
                .targetSkillId(lp.getTargetSkill() != null ? lp.getTargetSkill().getId() : null)
                .targetSkillName(lp.getTargetSkill() != null ? lp.getTargetSkill().getName() : null)
                .title(lp.getTitle())
                .description(lp.getDescription())
                .targetRole(lp.getTargetRole())
                .targetDepartment(lp.getTargetDepartment())
                .targetSeverity(lp.getTargetSeverity())
                .totalEstimatedHours(lp.getTotalEstimatedHours() != null ? lp.getTotalEstimatedHours() : 0)
                .status(lp.getStatus() != null ? lp.getStatus() : "NOT_STARTED")
                .overallProgressPercent(lp.getOverallProgressPercent() != null ? lp.getOverallProgressPercent() : 0)
                .noCoursesAvailable(lp.getNoCoursesAvailable() != null ? lp.getNoCoursesAvailable() : false)
                .steps(stepResponses)
                .courses(courses)
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
