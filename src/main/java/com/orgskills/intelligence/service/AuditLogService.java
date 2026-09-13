package com.orgskills.intelligence.service;

import com.orgskills.intelligence.entity.AuditLog;
import com.orgskills.intelligence.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * The audit trail.
 *
 * <p>Every entry is written in its own transaction. Joining the caller's would mean an entry
 * only survives if the operation it records succeeds, which is backwards for an audit log: a
 * refused login, a rejected change, an attempt on a deactivated account are exactly the events
 * worth keeping, and all of them end in a rollback that would take the record with them.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logEvent(Long actorUserId, String actorEmail, String action, String entityType, String entityId, String details) {
        try {
            AuditLog logEntry = new AuditLog();
            logEntry.setActorUserId(actorUserId);
            logEntry.setActorEmail(actorEmail != null ? actorEmail : "SYSTEM");
            logEntry.setAction(action);
            logEntry.setEntityType(entityType);
            logEntry.setEntityId(entityId);
            logEntry.setDetails(details);
            auditLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.error("Failed to persist audit log: {}", ex.getMessage(), ex);
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }
}
