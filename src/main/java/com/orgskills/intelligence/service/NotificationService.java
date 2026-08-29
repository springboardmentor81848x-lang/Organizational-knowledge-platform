package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.notification.NotificationResponse;
import com.orgskills.intelligence.entity.Notification;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.repository.NotificationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * In-app notifications: persisted to the database and pushed over the existing STOMP topic so an
 * open client sees them without polling.
 *
 * <h2>Delivering over email, SMS or push</h2>
 * Only in-app delivery is implemented. Every notification in the platform is created through
 * {@link #createNotification} or one of the typed helpers above it, so that method is the single
 * seam an outbound channel would hook into: a real integration adds its dispatch there, after the
 * row is saved, keyed off {@link NotificationType} so that — for example — a TRAINING_DEADLINE
 * also emails while a TRAINING_PROGRESS stays in-app.
 *
 * <p>Doing that properly needs things this stack does not yet have: a JavaMailSender (or Twilio or
 * FCM) configuration, per-user channel preferences and quiet hours, a retry and bounce policy, and
 * dispatch moved off the request thread so a slow provider cannot hold up an assessment
 * submission. Rather than stub those out and give the impression messages are going out, the
 * platform stores notifications in-app only and leaves this documented as the extension point.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    /** Roles allowed to read or act on somebody else's notifications. */
    private static final Set<Role> NOTIFICATION_ADMIN_ROLES = EnumSet.of(
            Role.HR_ADMIN, Role.SYSTEM_ADMIN, Role.ADMIN);

    /** Gap severities that are worth interrupting somebody about. */
    private static final Set<RiskSeverity> ALERTING_SEVERITIES =
            EnumSet.of(RiskSeverity.HIGH, RiskSeverity.CRITICAL);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Typed triggers ──────────────────────────────────────────────────────────

    /**
     * Raises a gap alert for a HIGH or CRITICAL gap. Lower severities are recorded by gap analysis
     * but not announced: an alert that fires for every shortfall is one people learn to ignore.
     * Returns null when the gap does not warrant an alert, or when an unread alert for the same
     * skill is already waiting.
     */
    @Transactional
    public Notification createGapAlert(User user, Skill skill, double gapScore, RiskSeverity severity) {
        if (!ALERTING_SEVERITIES.contains(severity)) {
            return null;
        }

        String title = severity.name().charAt(0) + severity.name().substring(1).toLowerCase()
                + " skill gap detected: " + skill.getName();
        if (notificationRepository.existsByUserIdAndTypeAndTitleAndIsReadFalse(
                user.getId(), NotificationType.GAP_ALERT, title)) {
            return null;
        }

        String message = "Your current proficiency gap for " + skill.getName() + " is "
                + String.format("%.2f", gapScore) + ". "
                + (severity == RiskSeverity.CRITICAL
                        ? "Immediate development action is recommended."
                        : "Development action is recommended.");
        return createNotification(user, title, message, NotificationType.GAP_ALERT);
    }

    @Transactional
    public Notification createMentorshipInvite(User user, String message) {
        return createNotification(user, "Mentorship invitation", message, NotificationType.MENTORSHIP_INVITE);
    }

    /**
     * Creates a notification only if this exact one has not already been sent to this user. Used by
     * the recurring scans, which would otherwise repeat the same reminder on every run.
     */
    @Transactional
    public Notification createOnce(User user, String title, String message, NotificationType type,
                                   String dedupeKey) {
        if (notificationRepository.existsByUserIdAndDedupeKey(user.getId(), dedupeKey)) {
            return null;
        }
        return save(user, title, message, type, dedupeKey);
    }

    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type) {
        return save(user, title, message, type, null);
    }

    private Notification save(User user, String title, String message, NotificationType type, String dedupeKey) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setDedupeKey(dedupeKey);

        Notification saved = notificationRepository.save(notification);
        // In-app push. An email, SMS or push channel would dispatch from here — see the class note.
        messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), toResponse(saved));
        return saved;
    }

    // ── Reading ─────────────────────────────────────────────────────────────────

    /**
     * A user's notifications, newest first. Reading somebody else's requires an admin role: a
     * notification feed is a running commentary on that person's assessments and gaps.
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getForUser(Long actorId, Long userId) {
        User actor = getUser(actorId);
        Long target = userId != null ? userId : actorId;
        requireCanActFor(actor, target);

        if (!userRepository.existsById(target)) {
            throw new ResourceNotFoundException("User not found for id: " + target);
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(target).stream()
                .map(this::toResponse)
                .toList();
    }

    // ── Marking read ────────────────────────────────────────────────────────────

    /** Marks one notification read, provided it belongs to the caller. */
    @Transactional
    public NotificationResponse markAsRead(Long actorId, Long notificationId) {
        User actor = getUser(actorId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification not found for id: " + notificationId));
        requireCanActFor(actor, notification.getUser().getId());

        notification.setIsRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private void requireCanActFor(User actor, Long userId) {
        if (!actor.getId().equals(userId) && !NOTIFICATION_ADMIN_ROLES.contains(actor.getRole())) {
            throw new UnauthorizedException("Access denied. These notifications belong to another user.");
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }

    public NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
