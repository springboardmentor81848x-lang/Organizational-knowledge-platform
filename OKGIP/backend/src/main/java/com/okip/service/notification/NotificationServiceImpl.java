package com.okip.service.notification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.okip.dto.notification.NotificationResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Notification;
import com.okip.entity.transaction.NotificationDevice;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.NotificationDeviceRepository;
import com.okip.repository.NotificationRepository;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationDeviceRepository deviceRepository;
    private final EmployeeRepository employeeRepository;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            NotificationDeviceRepository deviceRepository,
            EmployeeRepository employeeRepository) {
        this.notificationRepository = notificationRepository;
        this.deviceRepository = deviceRepository;
        this.employeeRepository = employeeRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponseDTO> getMine() {
        return notificationRepository.findTop50ByEmployeeOrderByCreatedAtDesc(current())
                .stream().map(this::dto).collect(Collectors.toList());
    }

    @Override
    public void markRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
        if (!n.getEmployee().getEmployeeId().equals(current().getEmployeeId())) {
            throw new ResourceNotFoundException("Notification not found.");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Override
    public void markAllRead() {
        Employee employee = current();
        notificationRepository.findTop50ByEmployeeOrderByCreatedAtDesc(employee)
                .forEach(n -> n.setRead(true));
    }

    @Override
    public void registerFid(String fid) {
        if (fid == null || fid.isBlank()) {
            throw new IllegalArgumentException("Firebase registration token is required.");
        }
        Employee employee = current();
        NotificationDevice device = deviceRepository.findByFid(fid.trim()).orElseGet(NotificationDevice::new);
        device.setFid(fid.trim());
        device.setEmployee(employee);
        device.setLastSeenAt(LocalDateTime.now());
        deviceRepository.save(device);
    }

    @Override
    public void notifyEmployee(Long employeeId, String type, String title, String message, String url) {
        Employee employee = employeeRepository.findById(employeeId).orElse(null);
        if (employee == null) return;

        Notification notification = new Notification();
        notification.setEmployee(employee);
        notification.setType(type == null ? "GENERAL" : type);
        notification.setTitle(title == null ? "OKGIP Notification" : title);
        notification.setMessage(message == null ? "You have a new OKGIP notification." : message);
        notificationRepository.save(notification);

        String targetUrl = url == null ? "/employee/notifications" : url;
        for (NotificationDevice device : deviceRepository.findByEmployee(employee)) {
            try {
                Message firebaseMessage = Message.builder()
                        // The value returned by Firebase Web getToken() is an FCM registration token.
                        .setToken(device.getFid())
                        .putData("type", notification.getType())
                        .putData("title", notification.getTitle())
                        .putData("body", notification.getMessage())
                        .putData("url", targetUrl)
                        .build();
                FirebaseMessaging.getInstance().send(firebaseMessage);
            } catch (Exception ignored) {
                // Database notification remains available even when browser push is unavailable.
            }
        }
    }

    private Employee current() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new ResourceNotFoundException("Authenticated employee not found.");
        }
        return employeeRepository.findByOfficialEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found."));
    }

    private NotificationResponseDTO dto(Notification n) {
        NotificationResponseDTO dto = new NotificationResponseDTO();
        dto.setNotificationId(n.getNotificationId());
        dto.setType(n.getType());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
