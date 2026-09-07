package com.okip.service.notification;

import java.util.List;
import com.okip.dto.notification.NotificationResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.enums.NotificationType;

public interface NotificationService {
    void createNotification(Employee recipient, String title, String message, NotificationType type, Long referenceId);
    List<NotificationResponseDTO> getMyNotifications();
    long getUnreadCount();
    void markAsRead(Long notificationId);
    void markAllAsRead();
}
