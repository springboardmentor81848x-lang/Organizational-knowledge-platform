package com.knowledgegap.repository;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    // Get all notifications for an employee
    List<Notification> findByRecipientOrderByCreatedDateDesc(
            Employee recipient
    );

    // Get unread notifications
    List<Notification> findByRecipientAndReadStatusFalseOrderByCreatedDateDesc(
            Employee recipient
    );
}