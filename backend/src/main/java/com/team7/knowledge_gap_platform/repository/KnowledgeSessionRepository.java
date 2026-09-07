package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team7.knowledge_gap_platform.entity.KnowledgeSession;

@Repository
public interface KnowledgeSessionRepository extends JpaRepository<KnowledgeSession, Long> {
    List<KnowledgeSession> findByStatusOrderByScheduledAtAsc(String status);
}
