package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    List<Notification> findByEmployeeIdAndReadStatusFalseOrderByCreatedAtDesc(Long employeeId);
}
