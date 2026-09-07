package com.okip.service.notification.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.okip.dto.notification.NotificationResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Notification;
import com.okip.enums.NotificationType;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.NotificationRepository;
import com.okip.service.notification.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmployeeRepository employeeRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository, EmployeeRepository employeeRepository) {
        this.notificationRepository = notificationRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional
    public void createNotification(Employee recipient, String title, String message, NotificationType type, Long referenceId) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setRead(false);
        notificationRepository.save(notification);
    }

    @Override
    public List<NotificationResponseDTO> getMyNotifications() {
        Employee employee = getLoggedInEmployee();
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(employee)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount() {
        Employee employee = getLoggedInEmployee();
        return notificationRepository.countByRecipientAndIsReadFalse(employee);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Employee employee = getLoggedInEmployee();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));

        if (!notification.getRecipient().getEmployeeId().equals(employee.getEmployeeId())) {
            throw new ResourceNotFoundException("Notification not found for current user.");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Employee employee = getLoggedInEmployee();
        List<Notification> unread = notificationRepository.findByRecipientAndIsReadFalseOrderByCreatedAtDesc(employee);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    private Employee getLoggedInEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return employeeRepository.findByOfficialEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in employee not found."));
    }

    private NotificationResponseDTO convertToDTO(Notification n) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setNotificationId(n.getNotificationId());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType().name());
        dto.setReferenceId(n.getReferenceId());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
