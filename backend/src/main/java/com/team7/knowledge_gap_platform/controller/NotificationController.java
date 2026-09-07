package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.Notification;
import com.team7.knowledge_gap_platform.repository.NotificationRepository;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long employeeId) {
        List<Notification> list = notificationRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/employee/{employeeId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long employeeId) {
        List<Notification> list = notificationRepository.findByEmployeeIdAndReadStatusFalseOrderByCreatedAtDesc(employeeId);
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setReadStatus(true);
            return ResponseEntity.ok(notificationRepository.save(notif));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        if (notification.getReadStatus() == null) {
            notification.setReadStatus(false);
        }
        Notification saved = notificationRepository.save(notification);
        return ResponseEntity.ok(saved);
    }
}
