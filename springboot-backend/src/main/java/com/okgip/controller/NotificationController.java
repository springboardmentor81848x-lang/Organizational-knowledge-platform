package com.okgip.controller;

import com.okgip.entity.Notification;
import com.okgip.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(@RequestParam(required = false) Long userId) {
        List<Notification> list = userId != null
                ? notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                : notificationRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(n -> {
            n.setIsRead(true);
            Notification saved = notificationRepository.save(n);
            return ResponseEntity.ok(Map.of("success", true, "message", "Notification marked as read", "data", saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestParam(required = false) Long userId) {
        List<Notification> list = userId != null
                ? notificationRepository.findByUserIdAndIsReadFalse(userId)
                : notificationRepository.findAll();
        for (Notification n : list) {
            n.setIsRead(true);
            notificationRepository.save(n);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "All notifications marked as read"));
    }
}
