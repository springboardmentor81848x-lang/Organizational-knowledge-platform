package com.knowledgeiq.repository;

import com.knowledgeiq.model.KnowledgeSessionRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KnowledgeSessionRegistrationRepository extends JpaRepository<KnowledgeSessionRegistration, UUID> {
    List<KnowledgeSessionRegistration> findBySessionId(UUID sessionId);
    List<KnowledgeSessionRegistration> findByUserId(UUID userId);
    Optional<KnowledgeSessionRegistration> findBySessionIdAndUserId(UUID sessionId, UUID userId);
    long countBySessionIdAndAttendanceStatusNot(UUID sessionId, String attendanceStatus);
}
