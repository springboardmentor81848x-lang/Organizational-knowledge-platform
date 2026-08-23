package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.Notification;
import com.team7.knowledge_gap_platform.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(
            NotificationRepository repository) {

        this.repository = repository;
    }

    public Notification createNotification(
            Long employeeId,
            String title,
            String message,
            String type) {

        Notification notification =
                new Notification();

        notification.setEmployeeId(employeeId);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReadStatus(false);
        notification.setCreatedAt(
                LocalDateTime.now());

        return repository.save(notification);
    }

    public List<Notification>
    getEmployeeNotifications(
            Long employeeId) {

        return repository
                .findByEmployeeIdOrderByCreatedAtDesc(
                        employeeId);
    }

    public List<Notification>
    getUnreadNotifications(
            Long employeeId) {

        return repository
                .findByEmployeeIdAndReadStatusOrderByCreatedAtDesc(
                        employeeId,
                        false);
    }

    public Notification markAsRead(
            Long notificationId) {

        Notification notification =
                repository.findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"));

        notification.setReadStatus(true);

        return repository.save(notification);
    }

    public void deleteNotification(
            Long notificationId) {

        repository.deleteById(notificationId);
    }
}