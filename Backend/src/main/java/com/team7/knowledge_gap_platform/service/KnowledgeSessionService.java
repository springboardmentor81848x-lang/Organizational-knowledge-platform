package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.KnowledgeSession;
import com.team7.knowledge_gap_platform.repository.KnowledgeSessionRepository;

@Service
public class KnowledgeSessionService {

    private final KnowledgeSessionRepository repository;

    public KnowledgeSessionService(
            KnowledgeSessionRepository repository) {
        this.repository = repository;
    }

    public KnowledgeSession createSession(
            KnowledgeSession session) {

        session.setStatus("SCHEDULED");
        session.setCreatedAt(LocalDateTime.now());

        return repository.save(session);
    }

    public List<KnowledgeSession> getAllSessions() {
        return repository.findAll();
    }

    public KnowledgeSession getSession(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Knowledge session not found"));
    }

    public List<KnowledgeSession> getByStatus(String status) {
        return repository.findByStatus(
                status.toUpperCase());
    }

    public List<KnowledgeSession> searchByTopic(String topic) {
        return repository.findByTopicContainingIgnoreCase(topic);
    }

    public KnowledgeSession completeSession(Long id) {

        KnowledgeSession session = getSession(id);
        session.setStatus("COMPLETED");

        return repository.save(session);
    }

    public KnowledgeSession cancelSession(Long id) {

        KnowledgeSession session = getSession(id);
        session.setStatus("CANCELLED");

        return repository.save(session);
    }
}