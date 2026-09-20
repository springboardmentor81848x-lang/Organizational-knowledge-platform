package com.okip.entity.transaction;
import java.time.LocalDateTime;
import com.okip.entity.master.Employee;
import jakarta.persistence.*;
@Entity
@Table(name="notification_devices", uniqueConstraints=@UniqueConstraint(columnNames="fid"))
public class NotificationDevice {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @Column(name="device_id") private Long deviceId;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="employee_id",nullable=false) private Employee employee;
 @Column(nullable=false,length=500) private String fid;
 @Column(name="last_seen_at",nullable=false) private LocalDateTime lastSeenAt;
 public Long getDeviceId(){return deviceId;} public void setDeviceId(Long v){deviceId=v;}
 public Employee getEmployee(){return employee;} public void setEmployee(Employee v){employee=v;}
 public String getFid(){return fid;} public void setFid(String v){fid=v;}
 public LocalDateTime getLastSeenAt(){return lastSeenAt;} public void setLastSeenAt(LocalDateTime v){lastSeenAt=v;}
}
