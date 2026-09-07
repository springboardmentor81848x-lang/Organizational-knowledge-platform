package com.knowledgeiq.service;

import com.knowledgeiq.model.Notification;
import com.knowledgeiq.model.User;
import com.knowledgeiq.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(UUID userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return list.stream()
                .filter(n -> n.getTitle() == null || !n.getTitle().contains("CRITICAL: High skill gap detected"))
                .filter(n -> n.getMessage() == null || !n.getMessage().contains("100% for your current role benchmark"))
                .collect(Collectors.toList());
    }

    public long getUnreadCount(UUID userId) {
        return getUserNotifications(userId).stream().filter(n -> !Boolean.TRUE.equals(n.getIsRead())).count();
    }

    public Notification markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void deleteNotification(UUID notificationId) {
        try {
            notificationRepository.deleteById(notificationId);
        } catch (Exception ignored) {}
    }

    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public Notification createNotification(User user, String eventType, String title, String message, String severity, String relatedEntityType, String relatedEntityId, String actionUrl) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null when creating notification");
        }

        if (title != null && title.contains("CRITICAL: High skill gap detected")) {
            return null;
        }

        // Deduplication check: Check if an identical notification was created for this user recently (within last 10 seconds or identical title & message in latest 3)
        List<Notification> recent = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        if (!recent.isEmpty()) {
            Notification latest = recent.get(0);
            if (latest.getTitle().equalsIgnoreCase(title) && 
                latest.getMessage().equalsIgnoreCase(message) && 
                latest.getCreatedAt() != null && 
                latest.getCreatedAt().isAfter(ZonedDateTime.now().minusSeconds(10))) {
                return latest; // Prevent rapid duplicate insertion
            }
        }

        Notification notification = new Notification(
                user,
                title,
                message,
                eventType,
                severity,
                relatedEntityType,
                relatedEntityId,
                actionUrl != null ? actionUrl : "/knowledge-gap"
        );

        return notificationRepository.save(notification);
    }

    public Notification createGapAlert(User user, String skillName, int gapPercentage, String severity, String relatedEntityId) {
        String title = "New skill gap detected";
        String message = String.format("Your %s gap is %d%% for your current role.", skillName, gapPercentage);
        return createNotification(user, "GAP_ALERT", title, message, severity, "SKILL_GAP", relatedEntityId, "/knowledge-gap");
    }

    public Notification createGapUpdated(User user, String skillName, int gapPercentage, String severity, String relatedEntityId) {
        String title = "Skill gap updated";
        String message = String.format("Your %s gap updated to %d%% for your current role.", skillName, gapPercentage);
        return createNotification(user, "GAP_UPDATED", title, message, severity, "SKILL_GAP", relatedEntityId, "/knowledge-gap");
    }

    public Notification createGapImproved(User user, String skillName, int oldGap, int newGap, String relatedEntityId) {
        String title = "Skill gap improved!";
        String message = String.format("Great progress! Your %s gap improved from %d%% to %d%%.", skillName, oldGap, newGap);
        return createNotification(user, "GAP_IMPROVED", title, message, "LOW", "SKILL_GAP", relatedEntityId, "/knowledge-gap");
    }

    public Notification createCriticalGap(User user, String skillName, int gapPercentage, String relatedEntityId) {
        String title = "Critical Risk Alert: " + skillName + " Shortage";
        String message = String.format("%s requires skill elevation in %s (%d%% discrepancy).", user != null ? user.getFullName() : "Member", skillName, gapPercentage);
        return createNotification(user, "CRITICAL_GAP", title, message, "CRITICAL", "SKILL_GAP", relatedEntityId, "/interventions");
    }

    public Notification createGapResolved(User user, String skillName, String relatedEntityId) {
        String title = "Skill gap resolved!";
        String message = String.format("Congratulations! You have fully closed your gap in %s.", skillName);
        return createNotification(user, "GAP_RESOLVED", title, message, "LOW", "SKILL_GAP", relatedEntityId, "/knowledge-gap");
    }

    public Notification createRecommendationNotification(User user, String title, String message, String actionUrl) {
        return createNotification(user, "RECOMMENDATION", title, message, "MEDIUM", "RECOMMENDATION", null, actionUrl != null ? actionUrl : "/learning");
    }

    public void notifyMentorshipRequest(User mentor, String menteeName, String skillName, UUID mentorshipId) {
        if (mentor == null) return;
        createNotification(
                mentor,
                "MENTORSHIP_REQUEST",
                "New Mentorship Request",
                menteeName + " requested your mentorship for " + skillName + ".",
                "MEDIUM",
                "MENTORSHIP",
                mentorshipId != null ? mentorshipId.toString() : null,
                "/employee/mentorship"
        );
    }

    public void notifyMentorAssigned(User mentor, String menteeName, String skillName, String adminName, UUID mentorshipId) {
        if (mentor == null) return;
        createNotification(
                mentor,
                "MENTORSHIP_ASSIGNED",
                "New Mentee Assignment from L&D",
                adminName + " assigned " + menteeName + " to you as a mentee for " + skillName + ". Please review and accept or decline.",
                "HIGH",
                "MENTORSHIP",
                mentorshipId != null ? mentorshipId.toString() : null,
                "/employee/mentorship"
        );
    }

    public void notifyMenteePendingAssignment(User mentee, String mentorName, String skillName, String adminName, UUID mentorshipId) {
        if (mentee == null) return;
        createNotification(
                mentee,
                "MENTORSHIP_PENDING",
                "Mentor Assigned by L&D (Pending Acceptance)",
                adminName + " assigned " + mentorName + " as your mentor for " + skillName + ". Awaiting mentor acceptance.",
                "MEDIUM",
                "MENTORSHIP",
                mentorshipId != null ? mentorshipId.toString() : null,
                "/employee/mentorship"
        );
    }

    public void notifyMentorshipAccepted(User mentee, String mentorName, String skillName, UUID mentorshipId) {
        if (mentee == null) return;
        createNotification(
                mentee,
                "MENTORSHIP_ACCEPTED",
                "Mentorship Request Accepted",
                mentorName + " accepted your " + skillName + " mentorship request.",
                "HIGH",
                "MENTORSHIP",
                mentorshipId != null ? mentorshipId.toString() : null,
                "/employee/mentorship"
        );
    }

    public void notifyMentorshipRejected(User mentee, String mentorName, String skillName, UUID mentorshipId) {
        if (mentee == null) return;
        createNotification(
                mentee,
                "MENTORSHIP_REJECTED",
                "Mentorship Request Declined",
                "Your mentorship request to " + mentorName + " for " + skillName + " was declined.",
                "LOW",
                "MENTORSHIP",
                mentorshipId != null ? mentorshipId.toString() : null,
                "/employee/mentorship"
        );
    }

    public void notifyMentorshipMessage(User recipient, String senderName, String textSnippet, UUID mentorshipId) {
        if (recipient == null) return;
        createNotification(
                recipient,
                "MENTORSHIP_MESSAGE",
                "New Mentorship Message",
                senderName + ": " + (textSnippet.length() > 60 ? textSnippet.substring(0, 57) + "..." : textSnippet),
                "LOW",
                "MENTORSHIP",
                mentorshipId != null ? mentorshipId.toString() : null,
                "/employee/mentorship"
        );
    }

    public void notifySessionCreated(User recipient, String mentorName, String sessionTitle, UUID sessionId) {
        if (recipient == null) return;
        createNotification(
                recipient,
                "SESSION_CREATED",
                "New Knowledge Sharing Session",
                mentorName + " scheduled a new session: " + sessionTitle + ".",
                "MEDIUM",
                "KNOWLEDGE_SESSION",
                sessionId != null ? sessionId.toString() : null,
                "/employee/mentorship"
        );
    }

    public void notifySessionRegistered(User recipient, String sessionTitle, UUID sessionId) {
        if (recipient == null) return;
        createNotification(
                recipient,
                "SESSION_REGISTERED",
                "Session Registration Confirmed",
                "You are registered for '" + sessionTitle + "'.",
                "LOW",
                "KNOWLEDGE_SESSION",
                sessionId != null ? sessionId.toString() : null,
                "/employee/mentorship"
        );
    }

    public void notifyLdCertSubmitted(User ldAdmin, String employeeName, String certName, UUID certId) {
        if (ldAdmin == null) return;
        createNotification(
                ldAdmin,
                "CERTIFICATION_SUBMITTED",
                "New Credential Verification Request",
                employeeName + " submitted '" + certName + "' for credential verification.",
                "MEDIUM",
                "CERTIFICATION",
                certId != null ? certId.toString() : null,
                "/ldadmin/certs"
        );
    }

    public void notifyCertVerified(User employee, String certName, String skillName) {
        if (employee == null) return;
        createNotification(
                employee,
                "CERTIFICATION_VERIFIED",
                "Certification Verified!",
                "Your credential '" + certName + "' has been verified by L&D. Your proficiency in " + skillName + " has been upgraded!",
                "HIGH",
                "CERTIFICATION",
                null,
                "/employee/inventory"
        );
    }

    public void notifyCertRejected(User employee, String certName) {
        if (employee == null) return;
        createNotification(
                employee,
                "CERTIFICATION_REJECTED",
                "Certification Submission Update",
                "Your certification submission '" + certName + "' was reviewed and declined by L&D.",
                "LOW",
                "CERTIFICATION",
                null,
                "/employee/inventory"
        );
    }

    @Autowired(required = false)
    private com.knowledgeiq.repository.AssessmentRepository assessmentRepository;

    @Autowired(required = false)
    private com.knowledgeiq.repository.CourseEnrollmentRepository enrollmentRepository;

    public int triggerReminders() {
        int triggered = 0;
        if (assessmentRepository != null) {
            List<com.knowledgeiq.model.Assessment> pending = assessmentRepository.findAll().stream()
                    .filter(a -> a.getStatus() == com.knowledgeiq.model.AssessmentStatus.PENDING)
                    .collect(Collectors.toList());
            for (com.knowledgeiq.model.Assessment a : pending) {
                if (a.getUser() != null && !Boolean.TRUE.equals(a.getReminderSent())) {
                    createNotification(
                            a.getUser(),
                            "ASSESSMENT_REMINDER",
                            "Reminder: Pending Assessment Due",
                            "Please remember to complete your assessment: " + a.getTitle(),
                            "MEDIUM",
                            "ASSESSMENT",
                            a.getId().toString(),
                            "/assessments"
                    );
                    a.setReminderSent(true);
                    assessmentRepository.save(a);
                    triggered++;
                }
            }
        }
        if (enrollmentRepository != null) {
            List<com.knowledgeiq.model.CourseEnrollment> active = enrollmentRepository.findAll().stream()
                    .filter(e -> "IN_PROGRESS".equalsIgnoreCase(e.getStatus()))
                    .collect(Collectors.toList());
            for (com.knowledgeiq.model.CourseEnrollment e : active) {
                if (e.getUser() != null && e.getCourse() != null) {
                    createNotification(
                            e.getUser(),
                            "TRAINING_REMINDER",
                            "Training Progress Reminder",
                            "Continue your progress on '" + e.getCourse().getTitle() + "'. You are currently at " + (e.getProgressPercent() != null ? e.getProgressPercent() : 0) + "%!",
                            "LOW",
                            "COURSE",
                            e.getCourse().getId().toString(),
                            "/training"
                    );
                    triggered++;
                }
            }
        }
        return triggered;
    }
}
