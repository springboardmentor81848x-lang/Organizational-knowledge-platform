package com.team7.knowledge_gap_platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.team7.knowledge_gap_platform.entity.KnowledgeSessionRegistration;

public interface KnowledgeSessionRegistrationRepository
        extends JpaRepository<KnowledgeSessionRegistration, Long> {

    List<KnowledgeSessionRegistration> findBySessionId(Long sessionId);

    List<KnowledgeSessionRegistration> findByEmployeeId(Long employeeId);

    List<KnowledgeSessionRegistration> findBySessionIdAndStatus(
            Long sessionId,
            String status);
}