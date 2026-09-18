package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.KnowledgeSession;
import com.orgskills.intelligence.entity.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface KnowledgeSessionRepository extends JpaRepository<KnowledgeSession, Long> {
    List<KnowledgeSession> findAllByOrderBySessionDateAsc();

    List<KnowledgeSession> findByStatusOrderBySessionDateAsc(SessionStatus status);

    List<KnowledgeSession> findByMentorIdOrderBySessionDateAsc(Long mentorId);

    List<KnowledgeSession> findByMentorIdAndStatusOrderBySessionDateAsc(Long mentorId, SessionStatus status);

    /** Sessions in a given state taking place within a window; backs the reminder scan. */
    List<KnowledgeSession> findByStatusAndSessionDateBetween(SessionStatus status, Instant from, Instant to);
}
