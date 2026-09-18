package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Notification;
import com.orgskills.intelligence.entity.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndTypeAndTitleAndIsReadFalse(Long userId, NotificationType type, String title);

    /** Backs the recurring jobs: has this exact reminder already gone out to this person? */
    boolean existsByUserIdAndDedupeKey(Long userId, String dedupeKey);
}
