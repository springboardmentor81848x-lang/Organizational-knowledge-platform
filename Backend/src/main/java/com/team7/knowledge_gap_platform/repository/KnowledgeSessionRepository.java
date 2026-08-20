package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.KnowledgeSession;

public interface KnowledgeSessionRepository
        extends JpaRepository<KnowledgeSession, Long> {

    List<KnowledgeSession> findByStatus(String status);

    List<KnowledgeSession> findByTopicContainingIgnoreCase(String topic);
}