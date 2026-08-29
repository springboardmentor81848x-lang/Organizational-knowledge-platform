package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.employee.EnrollmentRequest;
import com.orgskills.intelligence.dto.employee.EnrollmentResponse;
import com.orgskills.intelligence.dto.employee.LearningMilestoneResponse;
import com.orgskills.intelligence.dto.employee.MilestoneDefinitionRequest;
import com.orgskills.intelligence.dto.employee.UpdateProgressRequest;
import com.orgskills.intelligence.entity.Achievement;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.LearningMilestone;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AchievementType;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AchievementRepository;
import com.orgskills.intelligence.repository.CourseRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.LearningMilestoneRepository;
import com.orgskills.intelligence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Training enrolment and learning progress.
 *
 * <p>Completing a course fires the achievement and notification chain and nothing else. It
 * deliberately does <em>not</em> raise skill proficiency or recalculate gaps: proficiency moves
 * only on the evidence of an assessment, which belongs to the Assessment module. Keeping that
 * separation means clicking through a course never silently inflates the skill picture.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TrainingProgressService {

    /** Enrolments that still count as in flight, and so block a second enrolment in the course. */
    private static final Set<EnrollmentStatus> ACTIVE_STATUSES =
            EnumSet.of(EnrollmentStatus.NOT_STARTED, EnrollmentStatus.IN_PROGRESS);

    /** Terminal states in which the completion chain has already run. */
    private static final Set<EnrollmentStatus> FINISHED_STATUSES =
            EnumSet.of(EnrollmentStatus.COMPLETED, EnrollmentStatus.CERTIFIED);

    /** Roles allowed to enrol or inspect somebody other than themselves. */
    private static final Set<Role> TRAINING_ADMIN_ROLES = EnumSet.of(
            Role.MANAGER, Role.DEPARTMENT_HEAD, Role.HR_SPECIALIST, Role.HR_ADMIN,
            Role.LND_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN);

    /** Overall-progress marks that earn an encouragement notification when first crossed. */
    private static final int[] PROGRESS_NOTIFICATION_THRESHOLDS = {25, 50, 75};

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LearningMilestoneRepository milestoneRepository;
    private final AchievementRepository achievementRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final RecommendationService recommendationService;
    @Lazy
    private final LearningPathService learningPathService;

    // ── Enrolment ───────────────────────────────────────────────────────────────

    /**
     * Enrols an employee in a training. A second enrolment while an earlier one is still
     * NOT_STARTED or IN_PROGRESS is rejected; re-taking a finished or expired course is allowed.
     */
    @Transactional
    public EnrollmentResponse enroll(Long actorId, EnrollmentRequest request) {
        User actor = getUser(actorId);
        Long employeeId = request.getEmployeeId() != null ? request.getEmployeeId() : actorId;
        requireCanActFor(actor, employeeId);
        User employee = employeeId.equals(actorId) ? actor : getUser(employeeId);

        Course training = courseRepository.findById(request.getTrainingId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found for id: " + request.getTrainingId()));

        List<Enrollment> active = enrollmentRepository
                .findByEmployeeIdAndCourseIdAndStatusIn(employeeId, training.getId(), ACTIVE_STATUSES);
        if (!active.isEmpty()) {
            throw new ValidationException("Employee is already enrolled in "
                    + training.getTitle() + " and has not completed it yet");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setEmployee(employee);
        enrollment.setCourse(training);
        enrollment.setStatus(EnrollmentStatus.NOT_STARTED);
        enrollment.setProgress(0.0);
        enrollment.setTargetCompletionDate(request.getTargetCompletionDate());
        Enrollment saved = enrollmentRepository.save(enrollment);

        List<LearningMilestone> milestones = createMilestones(saved, training, request.getMilestones());

        notificationService.createNotification(
                employee,
                "Course Enrollment Confirmed",
                "You have successfully enrolled in " + training.getTitle(),
                NotificationType.TRAINING_RECOMMENDATION);

        auditLogService.logEvent(actorId, actor.getEmail(), "ENROLL_COURSE", "Enrollment",
                saved.getId().toString(), "Enrolled " + employee.getEmail() + " in course: " + training.getTitle());

        return toResponse(saved, milestones);
    }

    /**
     * Learner-owned milestone rows for a new enrolment: copied from the course template when one
     * exists, otherwise built from the definitions supplied with the request.
     */
    private List<LearningMilestone> createMilestones(Enrollment enrollment, Course training,
                                                     List<MilestoneDefinitionRequest> requested) {
        List<LearningMilestone> template =
                milestoneRepository.findByTrainingIdAndEnrollmentIsNullOrderBySequenceAsc(training.getId());

        List<LearningMilestone> created = new ArrayList<>();
        if (!template.isEmpty()) {
            for (LearningMilestone source : template) {
                created.add(newMilestone(enrollment, training, source.getTitle(), source.getSequence()));
            }
        } else if (requested != null) {
            for (MilestoneDefinitionRequest definition : requested) {
                created.add(newMilestone(enrollment, training, definition.getTitle(), definition.getSequence()));
            }
        }

        if (created.isEmpty()) {
            return List.of();
        }
        created.sort(Comparator.comparing(LearningMilestone::getSequence));
        return milestoneRepository.saveAll(created);
    }

    private LearningMilestone newMilestone(Enrollment enrollment, Course training, String title, Integer sequence) {
        LearningMilestone milestone = new LearningMilestone();
        milestone.setEnrollment(enrollment);
        milestone.setTraining(training);
        milestone.setTitle(title);
        milestone.setSequence(sequence);
        milestone.setCompletionPercentage(0.0);
        return milestone;
    }

    // ── Reading progress ────────────────────────────────────────────────────────

    /** All enrolments for an employee, newest first, each with its milestones and dates. */
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollments(Long actorId, Long employeeId) {
        User actor = getUser(actorId);
        Long target = employeeId != null ? employeeId : actorId;
        requireCanActFor(actor, target);

        return enrollmentRepository.findByEmployeeIdOrderByStartDateDesc(target).stream()
                .map(e -> toResponse(e, milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(e.getId())))
                .toList();
    }

    // ── Updating progress ───────────────────────────────────────────────────────

    /**
     * Updates the overall course percentage, one milestone's completion, or both. Reaching 100%
     * overall completes the enrolment and runs the completion chain.
     */
    @Transactional
    public EnrollmentResponse updateProgress(Long actorId, Long enrollmentId, UpdateProgressRequest request) {
        if (request.getProgress() == null && request.getMilestoneId() == null) {
            throw new ValidationException("Provide an overall progress value, a milestone update, or both");
        }
        if (request.getMilestoneId() != null && request.getCompletionPercentage() == null) {
            throw new ValidationException("completionPercentage is required when milestoneId is supplied");
        }

        User actor = getUser(actorId);
        Enrollment enrollment = getEnrollment(enrollmentId);
        requireCanActFor(actor, enrollment.getEmployee().getId());

        if (request.getMilestoneId() != null) {
            LearningMilestone milestone = milestoneRepository
                    .findByMilestoneIdAndEnrollmentId(request.getMilestoneId(), enrollmentId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Milestone " + request.getMilestoneId() + " not found on enrollment " + enrollmentId));
            milestone.setCompletionPercentage(clampPercent(request.getCompletionPercentage()));
            milestoneRepository.save(milestone);
        }

        boolean completed = false;
        if (request.getProgress() != null) {
            double previous = enrollment.getProgress() != null ? enrollment.getProgress() : 0.0;
            double updated = clampPercent(request.getProgress());
            enrollment.setProgress(updated);

            if (updated >= 100.0) {
                completed = applyCompletion(enrollment);
            } else {
                if (updated > 0.0 && enrollment.getStatus() == EnrollmentStatus.NOT_STARTED) {
                    enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);
                }
                notifyProgressThreshold(enrollment, previous, updated);
            }
        }

        Enrollment saved = enrollmentRepository.save(enrollment);
        if (completed) {
            runPostCompletionRefresh(saved);
        }
        return toResponse(saved, milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(saved.getId()));
    }

    /**
     * Marks an enrolment complete: sets the completion date and COMPLETED status, then awards the
     * achievement and sends the completion notification.
     */
    @Transactional
    public EnrollmentResponse complete(Long actorId, Long enrollmentId) {
        User actor = getUser(actorId);
        Enrollment enrollment = getEnrollment(enrollmentId);
        requireCanActFor(actor, enrollment.getEmployee().getId());

        boolean completed = applyCompletion(enrollment);
        Enrollment saved = enrollmentRepository.save(enrollment);
        if (completed) {
            auditLogService.logEvent(actorId, actor.getEmail(), "COMPLETE_COURSE", "Enrollment",
                    saved.getId().toString(), "Completed course: " + saved.getCourse().getTitle());
            runPostCompletionRefresh(saved);
        }
        return toResponse(saved, milestoneRepository.findByEnrollmentIdOrderBySequenceAsc(saved.getId()));
    }

    // ── Completion chain ────────────────────────────────────────────────────────

    /**
     * Applies completion to an enrolment and fires the achievement and notification chain exactly
     * once. Returns false when the enrolment was already finished, so a repeated call to
     * {@code /complete} — or a progress update that lands on 100% twice — cannot award a duplicate
     * achievement.
     */
    private boolean applyCompletion(Enrollment enrollment) {
        if (FINISHED_STATUSES.contains(enrollment.getStatus())) {
            return false;
        }

        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        enrollment.setCompletionDate(Instant.now());
        enrollment.setProgress(100.0);

        String courseTitle = enrollment.getCourse().getTitle();
        User employee = enrollment.getEmployee();

        Achievement achievement = new Achievement();
        achievement.setEmployee(employee);
        achievement.setType(AchievementType.COURSE_COMPLETED);
        achievement.setTitle("Course Completed: " + courseTitle);
        achievement.setDescription("Successfully completed 100% of " + courseTitle);
        achievementRepository.save(achievement);

        notificationService.createNotification(
                employee,
                "Achievement Unlocked!",
                "Congratulations! You completed " + courseTitle + ".",
                NotificationType.ACHIEVEMENT_UNLOCKED);

        return true;
    }

    /**
     * Best-effort refresh of the learner's course recommendations and learning-path bookkeeping.
     * Neither raises proficiency from this module, and a failure here must not roll back a
     * legitimately completed course.
     */
    private void runPostCompletionRefresh(Enrollment enrollment) {
        Long employeeId = enrollment.getEmployee().getId();
        try {
            recommendationService.generateRecommendations(employeeId);
        } catch (Exception ex) {
            log.warn("Adaptive recommendation generation failed: {}", ex.getMessage());
        }
        try {
            learningPathService.onEnrollmentCompleted(employeeId, enrollment.getCourse().getId());
        } catch (Exception ex) {
            log.warn("Learning path step completion failed: {}", ex.getMessage());
        }
    }

    /** Sends an encouragement notification the first time progress passes 25%, 50% or 75%. */
    private void notifyProgressThreshold(Enrollment enrollment, double previous, double updated) {
        for (int threshold : PROGRESS_NOTIFICATION_THRESHOLDS) {
            if (previous < threshold && updated >= threshold) {
                notificationService.createNotification(
                        enrollment.getEmployee(),
                        "Learning progress update",
                        "Congratulations! You completed " + formatPercent(updated) + "% of your learning path",
                        NotificationType.TRAINING_PROGRESS);
                return;
            }
        }
    }

    // ── Mapping and helpers ─────────────────────────────────────────────────────

    public EnrollmentResponse toResponse(Enrollment enrollment, List<LearningMilestone> milestones) {
        return EnrollmentResponse.builder()
                .enrollmentId(enrollment.getId())
                .employeeId(enrollment.getEmployee().getId())
                .employeeName(enrollment.getEmployee().getFullName())
                .trainingId(enrollment.getCourse().getId())
                .trainingTitle(enrollment.getCourse().getTitle())
                .provider(enrollment.getCourse().getProvider())
                .status(enrollment.getStatus())
                .progress(enrollment.getProgress())
                .startDate(enrollment.getStartDate())
                .completionDate(enrollment.getCompletionDate())
                .milestones(milestones == null
                        ? List.of()
                        : milestones.stream().map(this::toMilestoneResponse).toList())
                .build();
    }

    private LearningMilestoneResponse toMilestoneResponse(LearningMilestone milestone) {
        return LearningMilestoneResponse.builder()
                .milestoneId(milestone.getMilestoneId())
                .trainingId(milestone.getTraining().getId())
                .title(milestone.getTitle())
                .sequence(milestone.getSequence())
                .completionPercentage(milestone.getCompletionPercentage())
                .status(milestoneStatus(milestone.getCompletionPercentage()))
                .build();
    }

    /** Milestones report their state in the same vocabulary as the enrolment itself. */
    private EnrollmentStatus milestoneStatus(Double completionPercentage) {
        double value = completionPercentage != null ? completionPercentage : 0.0;
        if (value >= 100.0) {
            return EnrollmentStatus.COMPLETED;
        }
        return value > 0.0 ? EnrollmentStatus.IN_PROGRESS : EnrollmentStatus.NOT_STARTED;
    }

    private void requireCanActFor(User actor, Long employeeId) {
        if (!actor.getId().equals(employeeId) && !TRAINING_ADMIN_ROLES.contains(actor.getRole())) {
            throw new ValidationException("Access denied. This enrollment belongs to another employee.");
        }
    }

    private double clampPercent(double value) {
        return Math.max(0.0, Math.min(100.0, value));
    }

    private String formatPercent(double value) {
        return value == Math.rint(value) ? String.valueOf((long) value) : String.valueOf(value);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }

    private Enrollment getEnrollment(Long enrollmentId) {
        return enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found for id: " + enrollmentId));
    }
}
