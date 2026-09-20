package com.okip.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.okip.entity.transaction.KnowledgeSharingResource;

public interface KnowledgeSharingResourceRepository extends JpaRepository<KnowledgeSharingResource, Long> {
    List<KnowledgeSharingResource> findBySessionKnowledgeSessionIdOrderByCreatedAtDesc(Long sessionId);
    Optional<KnowledgeSharingResource> findByResourceIdAndSessionKnowledgeSessionId(Long resourceId, Long sessionId);
}
