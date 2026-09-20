package com.okip.entity.transaction;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import com.okip.entity.master.Employee;
import jakarta.persistence.*;

@Entity
@Table(name = "notifications", indexes = @Index(name = "idx_notifications_employee_created", columnList = "employee_id,created_at"))
public class Notification {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name="notification_id") private Long notificationId;
  @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="employee_id", nullable=false) private Employee employee;
  @Column(nullable=false,length=40) private String type;
  @Column(nullable=false,length=180) private String title;
  @Column(nullable=false,columnDefinition="TEXT") private String message;
  @Column(name="is_read",nullable=false) private boolean read = false;
  @CreationTimestamp @Column(name="created_at",updatable=false) private LocalDateTime createdAt;
  public Long getNotificationId(){return notificationId;} public void setNotificationId(Long v){notificationId=v;}
  public Employee getEmployee(){return employee;} public void setEmployee(Employee v){employee=v;}
  public String getType(){return type;} public void setType(String v){type=v;}
  public String getTitle(){return title;} public void setTitle(String v){title=v;}
  public String getMessage(){return message;} public void setMessage(String v){message=v;}
  public boolean isRead(){return read;} public void setRead(boolean v){read=v;}
  public LocalDateTime getCreatedAt(){return createdAt;}
}
