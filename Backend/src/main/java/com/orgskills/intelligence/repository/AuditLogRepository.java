package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrderByTimestampDesc();
    List<AuditLog> findByActorUserIdOrderByTimestampDesc(Long actorUserId);
}
