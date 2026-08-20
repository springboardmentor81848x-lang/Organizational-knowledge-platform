package com.knowledgeiq.repository;

import com.knowledgeiq.model.KnowledgeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface KnowledgeSessionRepository extends JpaRepository<KnowledgeSession, UUID> {
    List<KnowledgeSession> findByScheduledAtAfterOrderByScheduledAtAsc(ZonedDateTime dateTime);
    List<KnowledgeSession> findByMentorIdOrderByScheduledAtDesc(UUID mentorId);
    List<KnowledgeSession> findAllByOrderByScheduledAtDesc();
}
