package com.okip.service.notification;
import java.util.List;
import com.okip.dto.notification.NotificationResponseDTO;
public interface NotificationService {
 List<NotificationResponseDTO> getMine();
 void markRead(Long id);
 void markAllRead();
 void registerFid(String fid);
 void notifyEmployee(Long employeeId, String type, String title, String message, String url);
}
