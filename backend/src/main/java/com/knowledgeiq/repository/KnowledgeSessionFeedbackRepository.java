package com.knowledgeiq.repository;

import com.knowledgeiq.model.KnowledgeSessionFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KnowledgeSessionFeedbackRepository extends JpaRepository<KnowledgeSessionFeedback, UUID> {
    List<KnowledgeSessionFeedback> findBySessionId(UUID sessionId);
    Optional<KnowledgeSessionFeedback> findBySessionIdAndUserId(UUID sessionId, UUID userId);
}
