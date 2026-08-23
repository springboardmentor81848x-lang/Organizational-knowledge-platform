package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.team7.knowledge_gap_platform.entity.Notification;
import com.team7.knowledge_gap_platform.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(
            NotificationService service) {

        this.service = service;
    }

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @RequestBody Notification notification) {

        Notification created =
                service.createNotification(
                        notification.getEmployeeId(),
                        notification.getTitle(),
                        notification.getMessage(),
                        notification.getType()
                );

        return ResponseEntity.ok(created);
    }

    // =========================================================
    // GET EMPLOYEE NOTIFICATIONS
    // =========================================================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Notification>>
    getEmployeeNotifications(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                service.getEmployeeNotifications(
                        employeeId));
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    @GetMapping("/employee/{employeeId}/unread")
    public ResponseEntity<List<Notification>>
    getUnreadNotifications(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                service.getUnreadNotifications(
                        employeeId));
    }

    // =========================================================
    // MARK NOTIFICATION AS READ
    // =========================================================

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification>
    markAsRead(
            @PathVariable Long notificationId) {

        return ResponseEntity.ok(
                service.markAsRead(
                        notificationId));
    }

    // =========================================================
    // DELETE NOTIFICATION
    // =========================================================

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String>
    deleteNotification(
            @PathVariable Long notificationId) {

        service.deleteNotification(
                notificationId);

        return ResponseEntity.ok(
                "Notification deleted successfully");
    }
}