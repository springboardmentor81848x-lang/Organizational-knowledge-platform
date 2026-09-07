package com.okip.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(Employee recipient);
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(Employee recipient);
    long countByRecipientAndIsReadFalse(Employee recipient);
}
