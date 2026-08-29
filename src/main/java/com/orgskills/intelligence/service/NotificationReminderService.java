package com.orgskills.intelligence.service;

import com.orgskills.intelligence.entity.Assessment;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.KnowledgeSession;
import com.orgskills.intelligence.entity.SessionRegistration;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.SessionStatus;
import com.orgskills.intelligence.repository.AssessmentRepository;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.KnowledgeSessionRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * The reminders that come from time passing rather than from somebody doing something: a training
 * deadline drawing near, a session tomorrow, an assessment falling due.
 *
 * <p>Each scan is a plain public method so it can be invoked directly — by the scheduler in
 * production, and by a test that wants to observe the reminder without waiting for a cron window.
 *
 * <p>All three deduplicate on a key naming the exact thing being reminded about, so a nightly scan
 * reminds somebody once rather than every morning until they act.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationReminderService {

    /** How far ahead a training deadline is worth flagging. */
    static final Duration TRAINING_DEADLINE_HORIZON = Duration.ofDays(7);

    /** How far ahead a session is worth reminding about — far enough to still rearrange a day. */
    static final Duration SESSION_HORIZON = Duration.ofDays(1);

    /** How far ahead a pending assessment is worth chasing. */
    static final Duration ASSESSMENT_HORIZON = Duration.ofDays(3);

    private static final DateTimeFormatter ON_DATE =
            DateTimeFormatter.ofPattern("d MMMM yyyy").withZone(ZoneOffset.UTC);
    private static final DateTimeFormatter AT_TIME =
            DateTimeFormatter.ofPattern("d MMMM yyyy 'at' HH:mm 'UTC'").withZone(ZoneOffset.UTC);

    private static final Set<EnrollmentStatus> UNFINISHED =
            EnumSet.of(EnrollmentStatus.NOT_STARTED, EnrollmentStatus.IN_PROGRESS);

    private final EnrollmentRepository enrollmentRepository;
    private final KnowledgeSessionRepository sessionRepository;
    private final SessionRegistrationRepository registrationRepository;
    private final AssessmentRepository assessmentRepository;
    private final NotificationService notificationService;

    /**
     * Reminds learners whose target completion date is approaching and who have not finished.
     * Returns how many reminders were actually sent, which is what the scheduler logs.
     */
    @Transactional
    public int sendTrainingDeadlineReminders() {
        Instant now = Instant.now();
        List<Enrollment> approaching = enrollmentRepository.findByStatusInAndTargetCompletionDateBetween(
                UNFINISHED, now, now.plus(TRAINING_DEADLINE_HORIZON));

        int sent = 0;
        for (Enrollment enrollment : approaching) {
            String message = "Your target completion date for \"" + enrollment.getCourse().getTitle()
                    + "\" is " + ON_DATE.format(enrollment.getTargetCompletionDate()) + ". You are currently "
                    + formatPercent(enrollment.getProgress()) + "% through the course.";

            if (notificationService.createOnce(enrollment.getEmployee(), "Training deadline approaching",
                    message, NotificationType.TRAINING_DEADLINE,
                    "enrollment-deadline:" + enrollment.getId()) != null) {
                sent++;
            }
        }
        return sent;
    }

    /**
     * Reminds the host and everyone registered about a session happening within the next day.
     * Registrations are fetched for the whole batch rather than per session.
     */
    @Transactional
    public int sendSessionReminders() {
        Instant now = Instant.now();
        List<KnowledgeSession> upcoming = sessionRepository.findByStatusAndSessionDateBetween(
                SessionStatus.SCHEDULED, now, now.plus(SESSION_HORIZON));
        if (upcoming.isEmpty()) {
            return 0;
        }

        List<SessionRegistration> registrations = registrationRepository.findBySessionIdIn(
                upcoming.stream().map(KnowledgeSession::getId).toList());

        int sent = 0;
        for (KnowledgeSession session : upcoming) {
            String when = AT_TIME.format(session.getSessionDate());
            String key = "session-reminder:" + session.getId();

            if (notificationService.createOnce(session.getMentor(), "Session reminder",
                    "You are hosting \"" + session.getTitle() + "\" on " + when + ".",
                    NotificationType.SESSION_REMINDER, key) != null) {
                sent++;
            }

            for (SessionRegistration registration : registrations) {
                if (!registration.getSession().getId().equals(session.getId())) {
                    continue;
                }
                String message = "Your mentorship session \"" + session.getTitle() + "\" with "
                        + session.getMentor().getFullName() + " is scheduled for " + when + ".";
                if (notificationService.createOnce(registration.getEmployee(), "Session reminder",
                        message, NotificationType.SESSION_REMINDER, key) != null) {
                    sent++;
                }
            }
        }
        return sent;
    }

    /**
     * Chases assessments that are still PENDING with their scheduled date approaching. Both the
     * assessor and the employee hear about it: the assessor has the work to do, and the employee
     * has a right to know a review of them is due.
     */
    @Transactional
    public int sendAssessmentReminders() {
        Instant now = Instant.now();
        List<Assessment> due = assessmentRepository.findByStatusAndDateBetween(
                AssessmentStatus.PENDING, now, now.plus(ASSESSMENT_HORIZON));

        int sent = 0;
        for (Assessment assessment : due) {
            String when = ON_DATE.format(assessment.getDate());
            String key = "assessment-due:" + assessment.getId();
            User employee = assessment.getEmployee();
            User assessor = assessment.getAssessor();

            if (notificationService.createOnce(assessor, "Assessment due",
                    "The " + assessment.getAssessmentType() + " assessment you scheduled for "
                            + employee.getFullName() + " is due on " + when + ".",
                    NotificationType.ASSESSMENT_REMINDER, key) != null) {
                sent++;
            }

            // A self assessment has one person on both sides; do not tell them twice.
            if (!assessor.getId().equals(employee.getId())
                    && notificationService.createOnce(employee, "Assessment due",
                            "A " + assessment.getAssessmentType() + " assessment of your skills is due on "
                                    + when + ".",
                            NotificationType.ASSESSMENT_REMINDER, key) != null) {
                sent++;
            }
        }
        return sent;
    }

    private String formatPercent(Double progress) {
        double value = progress == null ? 0.0 : progress;
        return value == Math.rint(value) ? String.valueOf((long) value) : String.valueOf(value);
    }
}
