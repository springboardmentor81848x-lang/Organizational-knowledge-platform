package com.okip.dto.notification;
import java.time.LocalDateTime;
public class NotificationResponseDTO { private Long notificationId; private String type; private String title; private String message; private boolean read; private LocalDateTime createdAt;
 public Long getNotificationId(){return notificationId;} public void setNotificationId(Long v){notificationId=v;}
 public String getType(){return type;} public void setType(String v){type=v;}
 public String getTitle(){return title;} public void setTitle(String v){title=v;}
 public String getMessage(){return message;} public void setMessage(String v){message=v;}
 public boolean isRead(){return read;} public void setRead(boolean v){read=v;}
 public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
