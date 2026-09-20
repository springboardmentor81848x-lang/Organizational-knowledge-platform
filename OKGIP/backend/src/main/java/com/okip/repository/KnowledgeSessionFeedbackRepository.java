package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.master.Employee;
import com.okip.entity.transaction.KnowledgeSession;
import com.okip.entity.transaction.KnowledgeSessionFeedback;

public interface KnowledgeSessionFeedbackRepository extends JpaRepository<KnowledgeSessionFeedback, Long> {
    Optional<KnowledgeSessionFeedback> findBySessionAndReviewer(KnowledgeSession session, Employee reviewer);
    List<KnowledgeSessionFeedback> findBySession(KnowledgeSession session);
}
