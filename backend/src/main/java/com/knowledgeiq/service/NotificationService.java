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
}
