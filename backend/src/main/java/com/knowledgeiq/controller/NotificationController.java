package com.knowledgeiq.controller;

import com.knowledgeiq.model.Notification;
import com.knowledgeiq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping({"", "/", "/me"})
    public ResponseEntity<List<Notification>> getMyNotifications(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).build();
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(notificationService.getUserNotifications(UUID.fromString(userIdStr)));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<java.util.Map<String, Long>> getUnreadCount(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).build();
        String userIdStr = (String) auth.getPrincipal();
        long count = notificationService.getUnreadCount(UUID.fromString(userIdStr));
        return ResponseEntity.ok(java.util.Map.of("unreadCount", count));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable UUID notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable UUID notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) return ResponseEntity.status(401).build();
        String userIdStr = (String) auth.getPrincipal();
        notificationService.markAllAsRead(UUID.fromString(userIdStr));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/trigger-reminders")
    public ResponseEntity<java.util.Map<String, Object>> triggerReminders() {
        int count = notificationService.triggerReminders();
        return ResponseEntity.ok(java.util.Map.of("message", "Automated reminders processed", "remindersTriggered", count));
    }
}
