package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.KnowledgeSessionFeedback;

@Repository
public interface KnowledgeSessionFeedbackRepository
        extends JpaRepository<KnowledgeSessionFeedback, Long> {

    List<KnowledgeSessionFeedback> findBySessionId(Long sessionId);

    List<KnowledgeSessionFeedback> findByEmployeeId(Long employeeId);
}