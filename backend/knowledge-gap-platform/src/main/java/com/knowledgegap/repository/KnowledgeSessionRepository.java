package com.knowledgegap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.knowledgegap.entity.KnowledgeSession;

public interface KnowledgeSessionRepository
        extends JpaRepository<KnowledgeSession, Long> {

    // =========================================================
    // GET SESSIONS CREATED BY MENTOR
    // =========================================================

    List<KnowledgeSession> findByMentorId(
            Long mentorId);

    // =========================================================
    // GET SESSIONS BY STATUS
    // =========================================================

    List<KnowledgeSession> findByStatus(
            String status);

    // =========================================================
    // GET AVAILABLE SCHEDULED SESSIONS
    // =========================================================

    List<KnowledgeSession>
    findByStatusOrderBySessionDateAsc(
            String status);

    // =========================================================
    // COUNT MENTOR SESSIONS
    // =========================================================

    Long countByMentorId(
            Long mentorId);

    // =========================================================
    // COUNT MENTOR SESSIONS BY STATUS
    // =========================================================

    Long countByMentorIdAndStatus(
            Long mentorId,
            String status);
}