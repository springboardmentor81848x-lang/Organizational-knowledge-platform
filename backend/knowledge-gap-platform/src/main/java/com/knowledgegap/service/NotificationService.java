package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Notification;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.NotificationRepository;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            EmployeeRepository employeeRepository) {

        this.notificationRepository = notificationRepository;
        this.employeeRepository = employeeRepository;
    }

    // =========================================================
    // CREATE NOTIFICATION
    // =========================================================

    public Notification createNotification(
            Employee recipient,
            String type,
            String message) {

        if (recipient == null) {
            throw new RuntimeException(
                    "Notification recipient is required."
            );
        }

        if (message == null || message.trim().isEmpty()) {
            throw new RuntimeException(
                    "Notification message is required."
            );
        }

        Notification notification = new Notification();

        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setMessage(message);
        notification.setReadStatus(false);
        notification.setCreatedDate(LocalDateTime.now());

        return notificationRepository.save(notification);
    }

    // =========================================================
    // GET ALL NOTIFICATIONS FOR EMPLOYEE
    // =========================================================

    public List<Notification> getNotifications(
            Employee employee) {

        return notificationRepository
                .findByRecipientOrderByCreatedDateDesc(
                        employee
                );
    }

    // =========================================================
    // GET UNREAD NOTIFICATIONS
    // =========================================================

    public List<Notification> getUnreadNotifications(
            Employee employee) {

        return notificationRepository
                .findByRecipientAndReadStatusFalseOrderByCreatedDateDesc(
                        employee
                );
    }

    // =========================================================
    // MARK NOTIFICATION AS READ
    // =========================================================

    public Notification markAsRead(Long notificationId) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found."
                                )
                        );

        notification.setReadStatus(true);

        return notificationRepository.save(
                notification
        );
    }

    // =========================================================
    // SYSTEM ADMINISTRATOR NOTIFICATIONS
    // =========================================================
    //
    // Sends the notification to every employee whose
    // application/system role is SYSTEM_ADMINISTRATOR.
    //
    // Existing employee/mentor notifications are NOT changed.
    // =========================================================

    public void notifySystemAdministrators(
        String type,
        String message) {

        System.out.println(
                "========== SYSTEM ADMIN NOTIFICATION =========="
        );

        System.out.println(
                "Searching for SYSTEM_ADMINISTRATOR users..."
        );

        List<Employee> administrators =
                employeeRepository
                        .findByRoleRoleName(
                                "SYSTEM_ADMINISTRATOR"
                        );

        System.out.println(
                "SYSTEM ADMINISTRATORS FOUND: "
                        + administrators.size()
        );

        for (Employee administrator : administrators) {

                System.out.println(
                        "Creating notification for admin: "
                                + administrator.getEmployeeId()
                                + " | "
                                + administrator.getEmail()
                                + " | DB ID: "
                                + administrator.getId()
                );

                createNotification(
                        administrator,
                        type,
                        message
                );

                System.out.println(
                        "Notification created successfully for: "
                                + administrator.getEmployeeId()
                );
        }

        System.out.println(
                "==============================================="
        );
        }
}